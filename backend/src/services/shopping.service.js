const { pool } = require('../config/db');

// ── Ingredient categorisation ─────────────────────────────────────────────────

const CATEGORIES = {
  'Protein':      ['chicken', 'beef', 'salmon', 'tuna', 'egg', 'bacon', 'mince', 'fish'],
  'Vegetables':   ['carrot', 'cucumber', 'courgette', 'broccoli', 'pepper', 'tomato',
                   'onion', 'garlic', 'lentil', 'chickpea', 'cauliflower', 'bean',
                   'snap pea', 'green bean', 'spinach', 'kale'],
  'Fruit':        ['berries', 'banana', 'lemon', 'avocado', 'apricot', 'orange', 'apple'],
  'Dairy':        ['yogurt', 'cheese', 'milk', 'butter', 'feta', 'cheddar', 'cream'],
  'Grains':       ['oats', 'rice', 'granola', 'bread', 'pasta', 'flour', 'oatmeal'],
  'Nuts & Seeds': ['walnut', 'almond', 'cashew', 'nut', 'tahini', 'seed', 'pine nut'],
  'Pantry':       ['olive oil', 'soy sauce', 'honey', 'mustard', 'vinegar', 'cumin',
                   'paprika', 'cinnamon', 'oregano', 'dill', 'coriander', 'ginger',
                   'sesame oil', 'oil', 'salt', 'pepper', 'spice', 'chocolate',
                   'stock', 'tomato', 'sauce'],
};

function categorise(name) {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return 'Other';
}

// ── Ingredient parsing ────────────────────────────────────────────────────────

// Matches a leading quantity + optional unit, e.g. "200g", "2 tbsp", "1 large"
const AMOUNT_RE = /^([\d¼½¾.,/]+\s*(?:g|kg|ml|l|tbsp|tsp|cups?|oz|lb|small|medium|large|head|can|cans|cloves?|rashers?|handful|sprigs?|slices?|pieces?)?\s*)/i;

function parseIngredient(raw) {
  const str   = raw.trim();
  const match = str.match(AMOUNT_RE);
  const amount = match ? match[1].trim() : '';
  let   name   = match ? str.slice(match[1].length).trim() : str;

  // Normalise: drop trailing descriptors after comma (e.g. "garlic, minced" → "garlic")
  name = name.replace(/,.*$/, '').replace(/\(.*?\)/g, '').trim().toLowerCase();

  return { amount, name, original: str };
}

function parseIngredients(value) {
  if (!value) return [];
  let arr;
  try {
    arr = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    arr = typeof value === 'string'
      ? value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
      : [];
  }
  return Array.isArray(arr) ? arr.map((s) => parseIngredient(String(s))) : [];
}

// ── Service ───────────────────────────────────────────────────────────────────

async function generateFromRecipes(recipeIds) {
  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    throw { status: 400, message: 'recipe_ids must be a non-empty array.' };
  }

  const [recipes] = await pool.query(
    'SELECT id, title, ingredients FROM recipes WHERE id IN (?)',
    [recipeIds]
  );

  if (recipes.length === 0) {
    throw { status: 404, message: 'No matching recipes found.' };
  }

  // Collect and deduplicate ingredient names
  const grouped = {};   // name → { name, category, entries: [original strings] }

  for (const recipe of recipes) {
    const items = parseIngredients(recipe.ingredients);
    for (const item of items) {
      if (!item.name) continue;
      if (!grouped[item.name]) {
        grouped[item.name] = {
          name:     item.name,
          category: categorise(item.name),
          entries:  [],
        };
      }
      grouped[item.name].entries.push(item.original);
    }
  }

  // Build flat list sorted by category then name
  const items = Object.values(grouped).sort((a, b) => {
    const catCmp = a.category.localeCompare(b.category);
    return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name);
  });

  const sources = recipes.map((r) => ({ id: r.id, title: r.title }));
  return { items, sources };
}

module.exports = { generateFromRecipes };
