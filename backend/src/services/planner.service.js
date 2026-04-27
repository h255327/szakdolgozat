const UserModel   = require('../models/user.model');
const RecipeModel = require('../models/recipe.model');

// Meal slot share of daily calories
const SLOT_RATIOS = {
  breakfast: 0.25,
  lunch:     0.35,
  dinner:    0.30,
  snack:     0.10,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function generateDailyPlan(userId) {
  const user = await UserModel.findById(userId);
  if (!user) throw { status: 404, message: 'User not found.' };

  const calorieTarget = user.calorie_target || null;
  const dietType      = user.diet_type      || null;

  // Try to find recipes matching the user's diet type (stored as category)
  let pool = dietType ? await RecipeModel.findAll({ category: dietType }) : [];

  // Fall back to all recipes if there aren't enough typed ones
  if (pool.length < 3) {
    pool = await RecipeModel.findAll();
  }

  if (pool.length === 0) {
    return {
      calorie_target: calorieTarget,
      diet_type:      dietType,
      meals:          { breakfast: null, lunch: null, dinner: null, snack: null },
      note:           'No recipes found. Add some recipes to generate a plan.',
    };
  }

  const picked = shuffle(pool);
  const slots  = ['breakfast', 'lunch', 'dinner', 'snack'];

  const meals = {};
  slots.forEach((slot, i) => {
    const recipe = picked[i] || null;
    meals[slot] = recipe
      ? {
          recipe_id:          recipe.id,
          title:              recipe.title,
          category:           recipe.category     || null,
          description:        recipe.description  || null,
          image_url:          recipe.image_url    || null,
          prep_time:          recipe.prep_time     || null,
          servings:           recipe.servings      || null,
          calorie_target:     calorieTarget
            ? Math.round(calorieTarget * SLOT_RATIOS[slot])
            : null,
        }
      : null;
  });

  return { calorie_target: calorieTarget, diet_type: dietType, meals };
}

module.exports = { generateDailyPlan };
