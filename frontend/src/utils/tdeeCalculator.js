// ── Constants ─────────────────────────────────────────────────────────────────

export const ACTIVITY_MULTIPLIERS = {
  sedentary:         1.2,
  lightly_active:    1.375,
  moderately_active: 1.55,
  very_active:       1.725,
  extra_active:      1.9,
};

export const ACTIVITY_LABELS = {
  sedentary:         'Sedentary (little or no exercise)',
  lightly_active:    'Lightly active (1–3 days/week)',
  moderately_active: 'Moderately active (3–5 days/week)',
  very_active:       'Very active (6–7 days/week)',
  extra_active:      'Extra active (physical job or twice-a-day)',
};

export const GOAL_ADJUSTMENTS = {
  lose_weight:  -500,
  maintain:        0,
  gain_muscle:   300,
};

const GOAL_LABELS = {
  lose_weight:  'weight loss',
  maintain:     'maintenance',
  gain_muscle:  'muscle gain',
};

// Minimum safe daily calorie targets to prevent dangerously low recommendations.
// Values are widely used clinical guidelines, not medical advice.
export const SAFE_MINIMUMS = {
  male:    1500,
  female:  1200,
  default: 1200, // used when sex is unrecognised
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Calculates a recommended daily calorie target using Mifflin-St Jeor BMR,
 * an activity multiplier (TDEE), and a goal-based adjustment.
 *
 * Accepts field names that match both the DB column names and ProfilePage form
 * state, so callers can pass userDetails or form state directly.
 *
 * @param {object} userDetails
 *   { weight, height, age, sex, activity_level }
 *   weight         – kg  (number | string)
 *   height         – cm  (number | string)
 *   age            – years (number | string)
 *   sex            – 'male' | 'female'
 *   activity_level – one of the ACTIVITY_MULTIPLIERS keys
 *
 * @param {string|null} goal
 *   'lose_weight' | 'maintain' | 'gain_muscle' | null
 *   Defaults to 'maintain' when null or unrecognised.
 *
 * @returns {{
 *   bmr: number,
 *   tdee: number,
 *   goalAdjustment: number,
 *   rawRecommended: number,
 *   safeMinimum: number,
 *   wasClamped: boolean,
 *   recommendedCalories: number,
 *   explanation: string,
 * }} or null when any required field is missing or invalid.
 */
export function calculateRecommendedCalories(userDetails, goal) {
  const { weight, height, age, sex, activity_level } = userDetails || {};

  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);

  // All four biometric inputs are required for Mifflin-St Jeor
  if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) return null;
  if (sex !== 'male' && sex !== 'female') return null;
  if (!ACTIVITY_MULTIPLIERS[activity_level]) return null;

  // Mifflin-St Jeor BMR
  // Male:   10w + 6.25h − 5a + 5
  // Female: 10w + 6.25h − 5a − 161
  const sexOffset = sex === 'male' ? 5 : -161;
  const bmr       = Math.round(10 * w + 6.25 * h - 5 * a + sexOffset);

  const multiplier = ACTIVITY_MULTIPLIERS[activity_level];
  const tdee       = Math.round(bmr * multiplier);

  const normalizedGoal = Object.prototype.hasOwnProperty.call(GOAL_ADJUSTMENTS, goal) ? goal : 'maintain';
  const goalAdjustment = GOAL_ADJUSTMENTS[normalizedGoal];
  const rawRecommended = Math.round(tdee + goalAdjustment);

  // Clamp to the sex-specific safe minimum
  const safeMinimum        = SAFE_MINIMUMS[sex] ?? SAFE_MINIMUMS.default;
  const recommendedCalories = Math.max(rawRecommended, safeMinimum);
  const wasClamped          = recommendedCalories !== rawRecommended;

  const goalLabel = GOAL_LABELS[normalizedGoal];

  // Concise plain-language explanation (also usable for API responses)
  let explanation =
    `Your estimated daily energy need is ${tdee.toLocaleString()} kcal` +
    (goalAdjustment !== 0
      ? ` (${goalAdjustment > 0 ? '+' : ''}${goalAdjustment} kcal for ${goalLabel})`
      : '') +
    `, giving a recommended target of ${recommendedCalories.toLocaleString()} kcal/day.`;

  if (wasClamped) {
    explanation += ` Adjusted to the safe minimum of ${safeMinimum.toLocaleString()} kcal/day.`;
  }

  return {
    bmr,
    tdee,
    goalAdjustment,
    rawRecommended,
    safeMinimum,
    wasClamped,
    recommendedCalories,
    explanation,
  };
}
