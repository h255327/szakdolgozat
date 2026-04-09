/**
 * Single source of truth for recipe category metadata.
 * Used by RecipesPage, RecipeDetailPage, DietPlannerPage, HomePage,
 * AddRecipePage, and EditRecipePage.
 */

export const CATEGORIES = [
  { value: 'breakfast',    label: 'Breakfast',    icon: '🌅', css: 'cat-breakfast'    },
  { value: 'lunch',        label: 'Lunch',        icon: '☀️',  css: 'cat-lunch'        },
  { value: 'dinner',       label: 'Dinner',       icon: '🌙', css: 'cat-dinner'       },
  { value: 'snack',        label: 'Snack',        icon: '🍎', css: 'cat-snack'        },
  { value: 'dessert',      label: 'Dessert',      icon: '🍰', css: 'cat-dessert'      },
  { value: 'soup',         label: 'Soup',         icon: '🍲', css: 'cat-soup'         },
  { value: 'salad',        label: 'Salad',        icon: '🥗', css: 'cat-salad'        },
  { value: 'vegetarian',   label: 'Vegetarian',   icon: '🥦', css: 'cat-vegetarian'   },
  { value: 'mediterranean',label: 'Mediterranean',icon: '🫒', css: 'cat-mediterranean' },
  { value: 'keto',         label: 'Keto',         icon: '🥑', css: 'cat-keto'         },
  { value: 'high-protein', label: 'High-Protein', icon: '💪', css: 'cat-high-protein' },
  { value: 'quick meals',  label: 'Quick Meals',  icon: '⚡', css: 'cat-quick'        },
];

// Lookup maps derived from the list above — no duplication
export const CAT_CSS  = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.css]));
export const CAT_ICON = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.icon]));

/**
 * Return the CSS class and icon for a category string (case-insensitive).
 * Falls back to 'cat-default' / '🍴' for unknown values.
 */
export function getCatMeta(category) {
  const key = (category || '').toLowerCase();
  return {
    css:  CAT_CSS[key]  || 'cat-default',
    icon: CAT_ICON[key] || '🍴',
  };
}
