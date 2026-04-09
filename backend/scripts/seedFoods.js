/**
 * Seed script – creates the foods table if needed and inserts 55 common foods.
 *
 * Run from the backend/ directory:
 *   node scripts/seedFoods.js
 *
 * Safe to run multiple times – skips any name that already exists.
 * All nutrition values are per 100g and sourced from standard food composition data.
 */

'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'healthy_eating_app',
  waitForConnections: true,
});

// columns: name, category, calories, protein, carbs, fat  (all per 100g)
const FOODS = [
  // ── Poultry & Meat ───────────────────────────────────────────────────────
  ['Chicken breast (cooked)',  'protein',   165,  31.0,  0.0,  3.6, 'g'],
  ['Chicken thigh (cooked)',   'protein',   209,  26.0,  0.0, 10.9, 'g'],
  ['Turkey breast (cooked)',   'protein',   157,  29.4,  0.0,  3.6, 'g'],
  ['Beef mince (lean, cooked)','protein',   218,  25.8,  0.0, 12.3, 'g'],
  ['Pork tenderloin (cooked)', 'protein',   143,  26.2,  0.0,  3.5, 'g'],
  ['Beef steak (grilled)',     'protein',   217,  26.3,  0.0, 12.0, 'g'],

  // ── Fish & Seafood ────────────────────────────────────────────────────────
  ['Salmon (cooked)',          'protein',   208,  20.4,  0.0, 13.4, 'g'],
  ['Tuna (canned in water)',   'protein',   116,  25.5,  0.0,  1.0, 'g'],
  ['Cod fillet (cooked)',      'protein',    90,  19.9,  0.0,  0.8, 'g'],
  ['Prawns / Shrimp (cooked)', 'protein',    99,  23.7,  0.2,  0.3, 'g'],
  ['Mackerel (cooked)',        'protein',   239,  23.9,  0.0, 15.5, 'g'],
  ['Sardines (canned in oil)', 'protein',   208,  24.6,  0.0, 11.5, 'g'],

  // ── Eggs & Dairy ──────────────────────────────────────────────────────────
  ['Egg (whole, large)',       'dairy',     155,  12.6,  1.1, 10.6, 'g'],
  ['Egg white',                'dairy',      52,  10.9,  0.7,  0.2, 'g'],
  ['Greek yogurt (plain, 0%)', 'dairy',      59,   9.9,  3.6,  0.4, 'g'],
  ['Cottage cheese (low-fat)', 'dairy',      98,  11.1,  3.4,  4.3, 'g'],
  ['Milk (semi-skimmed)',      'dairy',      46,   3.4,  4.8,  1.5, 'ml'],
  ['Cheddar cheese',           'dairy',     403,  24.9,  1.3, 33.1, 'g'],
  ['Mozzarella',               'dairy',     280,  28.4,  2.2, 17.1, 'g'],
  ['Feta cheese',              'dairy',     264,  14.2,  4.1, 21.3, 'g'],

  // ── Plant-Based Protein ───────────────────────────────────────────────────
  ['Tofu (firm)',              'protein',    76,   8.1,  1.9,  4.2, 'g'],
  ['Tempeh',                   'protein',   193,  19.0,  9.4, 10.8, 'g'],
  ['Edamame (cooked)',         'protein',   121,  11.9,  8.9,  5.2, 'g'],

  // ── Grains & Starches ─────────────────────────────────────────────────────
  ['White rice (cooked)',      'grains',    130,   2.7, 28.2,  0.3, 'g'],
  ['Brown rice (cooked)',      'grains',    123,   2.7, 25.6,  1.0, 'g'],
  ['Oats (dry)',               'grains',    379,  13.2, 67.0,  6.9, 'g'],
  ['Pasta (cooked, plain)',    'grains',    131,   5.0, 25.0,  1.1, 'g'],
  ['Whole wheat pasta (cooked)','grains',   124,   5.3, 23.0,  1.0, 'g'],
  ['Quinoa (cooked)',          'grains',    120,   4.4, 21.3,  1.9, 'g'],
  ['White bread',              'grains',    265,   8.9, 49.0,  3.2, 'g'],
  ['Whole wheat bread',        'grains',    247,  13.0, 43.1,  3.4, 'g'],
  ['Sweet potato (cooked)',    'grains',     86,   1.6, 20.1,  0.1, 'g'],
  ['Potato (boiled)',          'grains',     87,   1.9, 20.1,  0.1, 'g'],
  ['Corn (cooked)',            'grains',    108,   3.3, 23.5,  1.4, 'g'],

  // ── Vegetables ────────────────────────────────────────────────────────────
  ['Broccoli (raw)',           'vegetables',  34,  2.8,  7.0,  0.4, 'g'],
  ['Spinach (raw)',            'vegetables',  23,  2.9,  3.6,  0.4, 'g'],
  ['Kale (raw)',               'vegetables',  49,  4.3,  8.8,  0.9, 'g'],
  ['Carrot (raw)',             'vegetables',  41,  0.9,  9.6,  0.2, 'g'],
  ['Tomato (raw)',             'vegetables',  18,  0.9,  3.9,  0.2, 'g'],
  ['Cucumber (raw)',           'vegetables',  15,  0.7,  3.6,  0.1, 'g'],
  ['Red bell pepper (raw)',    'vegetables',  31,  1.0,  6.0,  0.3, 'g'],
  ['Onion (raw)',              'vegetables',  40,  1.1,  9.3,  0.1, 'g'],
  ['Mushrooms (raw)',          'vegetables',  22,  3.1,  3.3,  0.3, 'g'],
  ['Courgette / Zucchini',     'vegetables',  17,  1.2,  3.1,  0.3, 'g'],
  ['Aubergine / Eggplant',     'vegetables',  25,  1.0,  5.9,  0.2, 'g'],
  ['Avocado',                  'vegetables', 160,  2.0,  8.5, 14.7, 'g'],

  // ── Fruits ────────────────────────────────────────────────────────────────
  ['Banana',                   'fruit',       89,  1.1, 22.8,  0.3, 'g'],
  ['Apple',                    'fruit',       52,  0.3, 13.8,  0.2, 'g'],
  ['Orange',                   'fruit',       47,  0.9, 11.8,  0.1, 'g'],
  ['Strawberries',             'fruit',       32,  0.7,  7.7,  0.3, 'g'],
  ['Blueberries',              'fruit',       57,  0.7, 14.5,  0.3, 'g'],
  ['Mango',                    'fruit',       60,  0.8, 15.0,  0.4, 'g'],
  ['Grapes',                   'fruit',       69,  0.7, 18.1,  0.2, 'g'],

  // ── Legumes ───────────────────────────────────────────────────────────────
  ['Lentils (cooked)',         'legumes',    116,   9.0, 20.1,  0.4, 'g'],
  ['Chickpeas (cooked)',       'legumes',    164,   8.9, 27.4,  2.6, 'g'],
  ['Black beans (cooked)',     'legumes',    132,   8.9, 23.7,  0.5, 'g'],
  ['Kidney beans (cooked)',    'legumes',    127,   8.7, 22.8,  0.5, 'g'],

  // ── Fats, Oils & Nuts ─────────────────────────────────────────────────────
  ['Olive oil',                'fats',       884,   0.0,  0.0,100.0, 'ml'],
  ['Butter',                   'fats',       717,   0.9,  0.1, 81.1, 'g'],
  ['Peanut butter',            'fats',       588,  25.1, 20.1, 50.4, 'g'],
  ['Almond butter',            'fats',       614,  21.1, 18.8, 55.5, 'g'],
  ['Almonds',                  'nuts',       579,  21.2, 21.7, 49.9, 'g'],
  ['Walnuts',                  'nuts',       654,  15.2, 13.7, 65.2, 'g'],
  ['Cashews',                  'nuts',       553,  18.2, 30.2, 43.9, 'g'],
  ['Chia seeds',               'nuts',       486,  16.5, 42.1, 30.7, 'g'],
  ['Flaxseeds',                'nuts',       534,  18.3, 28.9, 42.2, 'g'],

  // ── Other ─────────────────────────────────────────────────────────────────
  ['Honey',                    'other',      304,   0.3, 82.4,  0.0, 'g'],
  ['Oat milk (unsweetened)',   'dairy',       47,   1.0,  9.0,  1.0, 'ml'],
];

async function main() {
  console.log('Connecting to database…');
  const conn = await pool.getConnection();

  try {
    // Create table if it doesn't exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id                INT            NOT NULL AUTO_INCREMENT,
        name              VARCHAR(150)   NOT NULL,
        category          VARCHAR(100)   DEFAULT NULL,
        calories_per_100g DECIMAL(8, 2)  NOT NULL DEFAULT 0,
        protein_per_100g  DECIMAL(8, 2)  NOT NULL DEFAULT 0,
        carbs_per_100g    DECIMAL(8, 2)  NOT NULL DEFAULT 0,
        fat_per_100g      DECIMAL(8, 2)  NOT NULL DEFAULT 0,
        default_unit      VARCHAR(20)    NOT NULL DEFAULT 'g',
        PRIMARY KEY (id),
        INDEX idx_name (name)
      )
    `);

    // Collect existing names
    const [existing] = await conn.query('SELECT name FROM foods');
    const existingNames = new Set(existing.map((r) => r.name.toLowerCase()));

    let inserted = 0;
    let skipped  = 0;

    for (const [name, category, cal, prot, carbs, fat, unit] of FOODS) {
      if (existingNames.has(name.toLowerCase())) {
        skipped++;
        continue;
      }
      await conn.query(
        `INSERT INTO foods (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, default_unit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, category, cal, prot, carbs, fat, unit]
      );
      existingNames.add(name.toLowerCase());
      console.log(`  ✓  [${category}] ${name}`);
      inserted++;
    }

    console.log('\n─────────────────────────────────');
    console.log(`Inserted : ${inserted}`);
    console.log(`Skipped  : ${skipped} (already exist)`);
    console.log('Done.');
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
