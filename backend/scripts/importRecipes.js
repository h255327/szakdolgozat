/**
 * Import recipes from TheMealDB into the local recipes table.
 *
 * Usage (from the backend/ directory):
 *   node scripts/importRecipes.js
 *
 * No extra dependencies — uses Node.js built-in https module.
 * Requires a running MySQL instance and a valid .env file.
 */

'use strict';

require('dotenv').config();
const https = require('https');
const mysql = require('mysql2/promise');

// ── Database ──────────────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'healthy_eating_app',
  waitForConnections: true,
});

// ── HTTP helper ───────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ── TheMealDB helpers ─────────────────────────────────────────────────────────

const MEALDB = 'https://www.themealdb.com/api/json/v1/1';

/** Return an array of meal stubs { idMeal, strMeal } for a category. */
async function fetchMealStubs(category) {
  const data = await fetchJSON(`${MEALDB}/filter.php?c=${encodeURIComponent(category)}`);
  return data.meals || [];
}

/** Return the full meal object for a given meal ID. */
async function fetchMealDetail(id) {
  const data = await fetchJSON(`${MEALDB}/lookup.php?i=${id}`);
  return data.meals?.[0] || null;
}

/** Combine strIngredient* / strMeasure* pairs into a JSON array of strings. */
function extractIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] || '').trim();
    const measure = (meal[`strMeasure${i}`] || '').trim();
    if (!name) break;
    list.push(measure ? `${measure} ${name}` : name);
  }
  return JSON.stringify(list);
}

/** Build a short description from area + category. */
function buildDescription(meal) {
  const area = meal.strArea && meal.strArea !== 'Unknown' ? meal.strArea : null;
  const cat = meal.strCategory || null;
  if (area && cat) return `A ${area} ${cat.toLowerCase()} dish.`;
  if (cat) return `A classic ${cat.toLowerCase()} dish.`;
  return null;
}

// ── Category plan ─────────────────────────────────────────────────────────────
//
// mealdbCat  – TheMealDB category name
// ourCat     – maps to the 'category' column (breakfast/lunch/dinner/snack)
// dietHint   – used to resolve diet_type_id (null → 'general')
// count      – how many recipes to take from this category

const CATEGORY_PLAN = [
  { mealdbCat: 'Breakfast', ourCat: 'breakfast', dietHint: 'vegetarian', count: 7 },
  { mealdbCat: 'Chicken', ourCat: 'lunch', dietHint: 'general', count: 5 },
  { mealdbCat: 'Beef', ourCat: 'dinner', dietHint: 'general', count: 5 },
  { mealdbCat: 'Seafood', ourCat: 'dinner', dietHint: 'general', count: 5 },
  { mealdbCat: 'Vegetarian', ourCat: 'lunch', dietHint: 'vegetarian', count: 5 },
  { mealdbCat: 'Pasta', ourCat: 'lunch', dietHint: 'general', count: 4 },
  { mealdbCat: 'Dessert', ourCat: 'snack', dietHint: 'general', count: 4 },
];
// Total target: 35 recipes (some may be skipped as duplicates)

// ── Diet type resolution ──────────────────────────────────────────────────────
//
// Refined per meal using the TheMealDB 'strArea' field:
// Greek / Italian / Spanish / Moroccan / Tunisian → mediterranean
// Vegetarian / Vegan category → vegetarian
// Others → general

function resolveDietName(meal, hint) {
  const cat = (meal.strCategory || '').toLowerCase();
  const area = (meal.strArea || '').toLowerCase();

  if (cat === 'vegetarian' || cat === 'vegan') return 'vegetarian';

  const mediterraneanAreas = ['greek', 'italian', 'spanish', 'moroccan', 'tunisian', 'french'];
  if (mediterraneanAreas.includes(area)) return 'mediterranean';

  return hint || 'general';
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to database…');
  const conn = await pool.getConnection();

  try {
    // 1 ── Ensure image_url column exists (idempotent) ────────────────────────


    // 2 ── Find owner user (prefer admin, fall back to any user) ───────────────
    const [[owner]] = await conn.query(
      `SELECT id, username FROM users
       WHERE role = 'admin'
       ORDER BY id ASC
       LIMIT 1`
    );
    if (!owner) {
      throw new Error(
        'No admin user found. Run the seed script first: npm run seed'
      );
    }
    console.log(`Owner: "${owner.username}" (id=${owner.id})`);

    // 3 ── Load diet_types map ─────────────────────────────────────────────────
    const [dtRows] = await conn.query('SELECT id, name FROM diet_types');
    const dtMap = Object.fromEntries(dtRows.map((r) => [r.name, r.id]));
    if (Object.keys(dtMap).length === 0) {
      throw new Error(
        'No diet types found. Run the seed script first: npm run seed'
      );
    }

    // 4 ── Collect existing recipe titles to avoid duplicates ─────────────────
    const [existingRows] = await conn.query('SELECT title FROM recipes');
    const existingTitles = new Set(existingRows.map((r) => r.title.toLowerCase()));

    // 5 ── Fetch and insert ────────────────────────────────────────────────────
    let inserted = 0;
    let skipped = 0;

    for (const plan of CATEGORY_PLAN) {
      console.log(`\nFetching category "${plan.mealdbCat}" (up to ${plan.count})…`);

      const stubs = await fetchMealStubs(plan.mealdbCat);
      const batch = stubs.slice(0, plan.count);

      for (const stub of batch) {
        const meal = await fetchMealDetail(stub.idMeal);
        if (!meal) {
          console.log(`  ⚠  ${stub.strMeal} – detail fetch failed, skipping`);
          skipped++;
          continue;
        }

        if (existingTitles.has(meal.strMeal.toLowerCase())) {
          console.log(`  –  "${meal.strMeal}" already exists, skipping`);
          skipped++;
          continue;
        }

        const dietName = resolveDietName(meal, plan.dietHint);
        const dietId = dtMap[dietName] ?? dtMap['general'] ?? null;
        const ingredients = extractIngredients(meal);
        const description = buildDescription(meal);
        const instructions = (meal.strInstructions || '').trim() || null;
        const imageUrl = meal.strMealThumb || null;

        await conn.query(
          `INSERT INTO recipes
             (user_id, diet_type_id, title, description, category,
              ingredients, instructions, image_url, prep_time, servings)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            owner.id,
            dietId,
            meal.strMeal,
            description,
            plan.ourCat,
            ingredients,
            instructions,
            imageUrl,
            null,     // TheMealDB doesn't provide prep time
            2,        // sensible default
          ]
        );

        existingTitles.add(meal.strMeal.toLowerCase()); // guard within this run
        console.log(`  ✓  "${meal.strMeal}" (${dietName})`);
        inserted++;
      }
    }

    // 6 ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────');
    console.log(`Inserted: ${inserted} recipe(s)`);
    console.log(`Skipped:  ${skipped} (duplicates or fetch errors)`);
    console.log('Done.');
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('\nImport failed:', err.message);
  process.exit(1);
});
