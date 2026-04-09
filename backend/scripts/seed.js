/**
 * Seed script — inserts demo data for development and presentation.
 *
 * Run from the backend/ directory:
 *   node scripts/seed.js
 */

require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcrypt');

// ── DB connection ─────────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'healthy_eating_app',
  waitForConnections: true,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function ing(...items) {
  return JSON.stringify(items);
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const DIET_TYPES = [
  { name: 'general',       description: 'No specific dietary restriction.' },
  { name: 'vegetarian',    description: 'Plant-based with dairy and eggs allowed.' },
  { name: 'mediterranean', description: 'Whole grains, olive oil, fish, and vegetables.' },
  { name: 'keto',          description: 'High-fat, very low carbohydrate diet.' },
];

// 12 sample recipes – 3 breakfast, 3 lunch, 3 dinner, 3 snack
const RECIPES = [
  // ── Breakfast ──────────────────────────────────────────────────────────────
  {
    title:        'Oatmeal with Berries',
    category:     'breakfast',
    diet:         'vegetarian',
    description:  'Warm oats topped with fresh berries and a drizzle of honey.',
    ingredients:  ing('80g rolled oats', '250ml milk or plant milk', '100g mixed berries',
                      '1 tbsp honey', '1 tsp cinnamon'),
    instructions: 'Cook oats in milk over medium heat for 5 minutes, stirring frequently.\nTop with fresh berries, a drizzle of honey, and a sprinkle of cinnamon.',
    prep_time:    10,
    servings:     1,
  },
  {
    title:        'Greek Yogurt Bowl',
    category:     'breakfast',
    diet:         'vegetarian',
    description:  'Creamy Greek yogurt layered with granola, banana, and walnuts.',
    ingredients:  ing('200g Greek yogurt (full-fat)', '40g granola', '1 banana, sliced',
                      '20g walnuts', '1 tbsp honey'),
    instructions: 'Spoon yogurt into a bowl.\nLayer with granola, banana slices, and walnuts.\nFinish with a drizzle of honey.',
    prep_time:    5,
    servings:     1,
  },
  {
    title:        'Keto Bacon and Egg Omelette',
    category:     'breakfast',
    diet:         'keto',
    description:  'Fluffy three-egg omelette with crispy bacon and cheddar cheese.',
    ingredients:  ing('3 large eggs', '3 rashers bacon', '30g cheddar cheese, grated',
                      '1 tbsp butter', 'salt and pepper to taste'),
    instructions: 'Fry bacon in a non-stick pan until crispy; set aside.\nWhisk eggs with salt and pepper.\nMelt butter in the pan, pour in eggs, and cook on low until just set.\nAdd cheese and crumbled bacon, fold omelette, and serve.',
    prep_time:    15,
    servings:     1,
  },

  // ── Lunch ──────────────────────────────────────────────────────────────────
  {
    title:        'Grilled Chicken Salad',
    category:     'lunch',
    diet:         'general',
    description:  'Tender grilled chicken breast over crisp mixed greens with a lemon vinaigrette.',
    ingredients:  ing('180g chicken breast', '80g mixed salad leaves', '1 avocado, sliced',
                      '100g cherry tomatoes, halved', '2 tbsp olive oil', '1 lemon, juice',
                      'salt and pepper to taste'),
    instructions: 'Season chicken with salt, pepper, and a splash of lemon juice.\nGrill on medium-high heat for 6–7 minutes per side until cooked through. Let rest, then slice.\nToss greens, tomatoes, and avocado with olive oil and lemon juice.\nTop with sliced chicken.',
    prep_time:    20,
    servings:     1,
  },
  {
    title:        'Mediterranean Rice Bowl',
    category:     'lunch',
    diet:         'mediterranean',
    description:  'Herby brown rice with roasted chickpeas, cucumber, olives, and tzatziki.',
    ingredients:  ing('150g cooked brown rice', '100g canned chickpeas, drained',
                      '½ cucumber, diced', '50g kalamata olives', '50g feta cheese',
                      '2 tbsp tzatziki', '1 tbsp olive oil', '1 tsp dried oregano'),
    instructions: 'Toss chickpeas with olive oil and oregano, roast at 200°C for 20 minutes until golden.\nBuild the bowl: rice at the base, then cucumber, olives, feta, and roasted chickpeas.\nFinish with a generous spoonful of tzatziki.',
    prep_time:    30,
    servings:     1,
  },
  {
    title:        'Tuna Niçoise Salad',
    category:     'lunch',
    diet:         'mediterranean',
    description:  'Classic French salad with tuna, green beans, boiled eggs, and Dijon dressing.',
    ingredients:  ing('1 can (160g) tuna in olive oil, drained', '2 boiled eggs, halved',
                      '100g green beans, blanched', '10 black olives', '8 cherry tomatoes',
                      '1 tbsp Dijon mustard', '2 tbsp olive oil', '1 tbsp red wine vinegar'),
    instructions: 'Whisk mustard, olive oil, and vinegar into a dressing.\nArrange green beans, tomatoes, olives, and eggs on a plate.\nFlake tuna over the top and drizzle with dressing.',
    prep_time:    20,
    servings:     1,
  },

  // ── Dinner ─────────────────────────────────────────────────────────────────
  {
    title:        'Baked Salmon with Roasted Vegetables',
    category:     'dinner',
    diet:         'general',
    description:  'Oven-baked salmon fillet alongside colourful roasted vegetables.',
    ingredients:  ing('200g salmon fillet', '1 courgette, sliced', '1 red pepper, diced',
                      '200g broccoli florets', '2 tbsp olive oil', '2 garlic cloves, minced',
                      '1 lemon', 'salt, pepper, and fresh dill'),
    instructions: 'Preheat oven to 200°C.\nToss vegetables with olive oil, garlic, salt, and pepper; spread on a baking tray.\nPlace salmon on top, season, and add lemon slices.\nBake 18–20 minutes until salmon flakes easily.',
    prep_time:    30,
    servings:     2,
  },
  {
    title:        'Chicken and Vegetable Stir-Fry',
    category:     'dinner',
    diet:         'general',
    description:  'Quick wok-cooked chicken with seasonal vegetables in a ginger-soy sauce.',
    ingredients:  ing('300g chicken breast, sliced thin', '1 red pepper, julienned',
                      '100g snap peas', '1 carrot, julienned', '3 tbsp soy sauce',
                      '1 tbsp sesame oil', '1 tsp fresh ginger, grated', '2 garlic cloves',
                      '150g cooked rice'),
    instructions: 'Mix soy sauce, sesame oil, ginger, and garlic.\nStir-fry chicken in a hot wok with a splash of oil until golden.\nAdd vegetables and stir-fry 3–4 minutes until tender-crisp.\nPour sauce over, toss well, and serve with rice.',
    prep_time:    25,
    servings:     2,
  },
  {
    title:        'Red Lentil Soup',
    category:     'dinner',
    diet:         'vegetarian',
    description:  'Hearty and warming red lentil soup spiced with cumin and smoked paprika.',
    ingredients:  ing('200g red lentils, rinsed', '1 onion, diced', '2 garlic cloves',
                      '1 carrot, diced', '400g canned chopped tomatoes', '900ml vegetable stock',
                      '1 tsp cumin', '1 tsp smoked paprika', '2 tbsp olive oil', 'juice of ½ lemon'),
    instructions: 'Sauté onion and carrot in olive oil for 5 minutes.\nAdd garlic, cumin, and paprika; cook 1 minute.\nStir in lentils, tomatoes, and stock. Simmer 20 minutes until lentils are soft.\nBlend half the soup for a creamy texture, season with lemon juice, salt, and pepper.',
    prep_time:    35,
    servings:     4,
  },
  {
    title:        'Keto Beef Bowl with Cauliflower Rice',
    category:     'dinner',
    diet:         'keto',
    description:  'Seasoned beef mince served over buttery cauliflower rice with avocado.',
    ingredients:  ing('250g beef mince (20% fat)', '1 head cauliflower, grated',
                      '1 avocado, sliced', '2 tbsp butter', '1 tbsp olive oil',
                      '1 tsp cumin', '1 tsp garlic powder', 'salt and pepper',
                      'fresh coriander to serve'),
    instructions: 'Brown beef mince with cumin, garlic powder, salt, and pepper; drain excess fat.\nSauté grated cauliflower in butter for 5 minutes until tender.\nBuild bowl: cauliflower rice base, beef mince, avocado slices, and fresh coriander.',
    prep_time:    25,
    servings:     2,
  },

  // ── Snack ──────────────────────────────────────────────────────────────────
  {
    title:        'Mixed Nuts and Dried Fruit',
    category:     'snack',
    diet:         'general',
    description:  'A satisfying handful of mixed nuts and dried fruit for sustained energy.',
    ingredients:  ing('30g almonds', '20g cashews', '15g walnuts',
                      '20g dried apricots, chopped', '15g dark chocolate chips'),
    instructions: 'Mix all ingredients together and portion into a small bowl or bag.',
    prep_time:    2,
    servings:     1,
  },
  {
    title:        'Hummus and Vegetable Sticks',
    category:     'snack',
    diet:         'vegetarian',
    description:  'Creamy homemade hummus served with crisp vegetable dippers.',
    ingredients:  ing('200g canned chickpeas, drained', '2 tbsp tahini', '1 lemon, juice',
                      '1 garlic clove', '2 tbsp olive oil', '2 tbsp water',
                      '2 carrots, cut into sticks', '1 cucumber, cut into sticks',
                      '1 red pepper, sliced'),
    instructions: 'Blend chickpeas, tahini, lemon juice, garlic, olive oil, and water until smooth.\nSeason with salt and a drizzle of olive oil.\nServe alongside carrot, cucumber, and pepper sticks.',
    prep_time:    10,
    servings:     2,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to database…');
  const conn = await pool.getConnection();

  try {
    // 1 ── Demo user ──────────────────────────────────────────────────────────
    console.log('Creating demo user (if not exists)…');
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await conn.query(
      `INSERT IGNORE INTO users (username, email, password_hash, role)
       VALUES ('demo', 'demo@healthyeat.dev', ?, 'user')`,
      [passwordHash]
    );
    const [[{ id: userId }]] = await conn.query(
      "SELECT id FROM users WHERE email = 'demo@healthyeat.dev'"
    );
    console.log(`  → owner user_id = ${userId}`);

    // 2 ── Diet types ─────────────────────────────────────────────────────────
    console.log('Inserting diet types…');
    for (const dt of DIET_TYPES) {
      await conn.query(
        'INSERT IGNORE INTO diet_types (name, description) VALUES (?, ?)',
        [dt.name, dt.description]
      );
    }
    const [dtRows] = await conn.query('SELECT id, name FROM diet_types');
    const dtMap = Object.fromEntries(dtRows.map((r) => [r.name, r.id]));

    // 3 ── Recipes ─────────────────────────────────────────────────────────────
    console.log(`Inserting ${RECIPES.length} recipes…`);
    for (const r of RECIPES) {
      await conn.query(
        `INSERT INTO recipes
           (user_id, diet_type_id, title, description, category,
            ingredients, instructions, prep_time, servings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          dtMap[r.diet] || null,
          r.title,
          r.description,
          r.category,
          r.ingredients,
          r.instructions,
          r.prep_time,
          r.servings,
        ]
      );
      console.log(`  ✓ ${r.title}`);
    }

    console.log('\nSeeding complete.');
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
