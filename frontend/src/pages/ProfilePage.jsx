import { useState, useEffect, useMemo } from 'react';
import { getMe, updateMe } from '../services/usersApi';
import { calculateRecommendedCalories, ACTIVITY_LABELS } from '../utils/tdeeCalculator';

const GOAL_OPTIONS = [
  { value: '',            label: '— select —' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'maintain',    label: 'Maintain weight' },
  { value: 'gain_muscle', label: 'Gain muscle' },
];

const SEX_OPTIONS = [
  { value: '',       label: '— select —' },
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ACTIVITY_OPTIONS = [
  { value: '', label: '— select —' },
  ...Object.entries(ACTIVITY_LABELS).map(([value, label]) => ({ value, label })),
];

const GOAL_LABELS = {
  lose_weight:  'weight loss',
  maintain:     'maintenance',
  gain_muscle:  'muscle gain',
};

const EMPTY_FORM = {
  username: '', email: '',
  weight: '', height: '', age: '', sex: '', activity_level: '',
  goal: '', diet_type: '', calorie_target: '',
  notification_preferences: '',
};

function ProfilePage() {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        const u = data.user;
        setForm({
          username:                 u.username        ?? '',
          email:                    u.email           ?? '',
          weight:                   u.weight          ?? '',
          height:                   u.height          ?? '',
          age:                      u.age             ?? '',
          sex:                      u.sex             ?? '',
          activity_level:           u.activity_level  ?? '',
          goal:                     u.goal            ?? '',
          diet_type:                u.diet_type       ?? '',
          calorie_target:           u.calorie_target  ?? '',
          notification_preferences: u.notification_preferences
            ? JSON.stringify(u.notification_preferences) : '',
        });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  // Recompute recommendation whenever any relevant field changes.
  // calculateRecommendedCalories returns null when any required field is absent.
  const recommendation = useMemo(
    () => calculateRecommendedCalories(form, form.goal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.weight, form.height, form.age, form.sex, form.activity_level, form.goal]
  );

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function applyRecommendation() {
    if (!recommendation) return;
    setForm(prev => ({ ...prev, calorie_target: String(recommendation.recommendedCalories) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      username:       form.username       || undefined,
      weight:         form.weight         !== '' ? Number(form.weight)         : undefined,
      height:         form.height         !== '' ? Number(form.height)         : undefined,
      age:            form.age            !== '' ? Number(form.age)            : undefined,
      sex:            form.sex            || undefined,
      activity_level: form.activity_level || undefined,
      goal:           form.goal           || undefined,
      diet_type:      form.diet_type      || undefined,
      calorie_target: form.calorie_target !== '' ? Number(form.calorie_target) : undefined,
    };

    if (form.notification_preferences.trim()) {
      try {
        payload.notification_preferences = JSON.parse(form.notification_preferences);
      } catch {
        setSaving(false);
        return setError('Notification preferences must be valid JSON.');
      }
    }

    try {
      await updateMe(payload);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading profile…
    </div>
  );

  // Whether enough biometric data exists to run the formula
  const canCompute = !!(form.weight && form.height && form.age && form.sex && form.activity_level);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.25rem' }}>Profile</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage your personal information and nutrition goals
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Account ─────────────────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Account</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input id="username" name="username" type="text" className="form-input"
                  value={form.username} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="form-input"
                  value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Email cannot be changed.
                </p>
              </div>
            </div>
          </div>

          {/* ── Body metrics ────────────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600 }}>Body Metrics</h2>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Used to calculate your recommended daily calorie target.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (kg)</label>
                  <input id="weight" name="weight" type="number" min="0" step="0.1"
                    className="form-input" value={form.weight} onChange={handleChange}
                    placeholder="e.g. 75" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="height">Height (cm)</label>
                  <input id="height" name="height" type="number" min="0" step="0.1"
                    className="form-input" value={form.height} onChange={handleChange}
                    placeholder="e.g. 175" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="age">Age (years)</label>
                  <input id="age" name="age" type="number" min="1" max="120" step="1"
                    className="form-input" value={form.age} onChange={handleChange}
                    placeholder="e.g. 28" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="sex">Biological sex</label>
                  <select id="sex" name="sex" className="form-select"
                    value={form.sex} onChange={handleChange}>
                    {SEX_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="activity_level">Activity level</label>
                <select id="activity_level" name="activity_level" className="form-select"
                  value={form.activity_level} onChange={handleChange}>
                  {ACTIVITY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Nutrition goals ─────────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Nutrition Goals</h2>

              <div className="form-group">
                <label className="form-label" htmlFor="goal">Goal</label>
                <select id="goal" name="goal" className="form-select"
                  value={form.goal} onChange={handleChange}>
                  {GOAL_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Recommendation card — shown only when a goal is selected */}
              {form.goal && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderLeft: '4px solid #3B82F6',
                  borderRadius: '8px',
                }}>
                  {recommendation ? (
                    <>
                      {/* Header row: title + button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1D4ED8' }}>
                          Recommended for {GOAL_LABELS[form.goal] || form.goal}
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ flexShrink: 0 }}
                          onClick={applyRecommendation}
                        >
                          Use recommended target
                        </button>
                      </div>

                      {/* Calculation breakdown */}
                      <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#374151' }}>Estimated maintenance calories (TDEE)</span>
                          <span style={{ fontWeight: 500 }}>{recommendation.tdee.toLocaleString()} kcal</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#374151' }}>
                            Goal adjustment ({GOAL_LABELS[form.goal]})
                          </span>
                          <span style={{
                            fontWeight: 500,
                            color: recommendation.goalAdjustment < 0 ? '#059669'
                              : recommendation.goalAdjustment > 0 ? '#D97706'
                              : '#374151',
                          }}>
                            {recommendation.goalAdjustment === 0
                              ? 'none'
                              : `${recommendation.goalAdjustment > 0 ? '+' : ''}${recommendation.goalAdjustment} kcal`}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          borderTop: '1px solid #BFDBFE',
                          paddingTop: '0.4rem', marginTop: '0.1rem',
                        }}>
                          <span style={{ fontWeight: 600, color: '#1D4ED8' }}>Recommended daily target</span>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1D4ED8' }}>
                            {recommendation.recommendedCalories.toLocaleString()} kcal/day
                          </span>
                        </div>
                      </div>

                      {/* Safety clamp warning */}
                      {recommendation.wasClamped && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          background: '#FFF7ED',
                          border: '1px solid #FED7AA',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#92400E',
                          lineHeight: 1.5,
                        }}>
                          ⚠ The calculated value ({recommendation.rawRecommended.toLocaleString()} kcal) is below the
                          safe minimum of {recommendation.safeMinimum.toLocaleString()} kcal/day for {form.sex}s. The
                          recommendation has been adjusted upward. Going below this level is not advisable without
                          medical supervision.
                        </div>
                      )}

                      {/* Disclaimer */}
                      <p style={{ margin: '0.65rem 0 0', fontSize: '0.78rem', color: '#6B7280', fontStyle: 'italic' }}>
                        This is an estimate based on standard formulas. You can adjust the target manually based on your progress and how you feel.
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
                      💡 {canCompute
                        ? 'Select an activity level above to get a recommendation.'
                        : 'Complete your body metrics (weight, height, age, sex, and activity level) to get a recommended calorie target.'}
                    </p>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="calorie_target">Daily calorie target (kcal)</label>
                <input id="calorie_target" name="calorie_target" type="number" min="0"
                  className="form-input" value={form.calorie_target} onChange={handleChange}
                  placeholder={recommendation ? `e.g. ${recommendation.recommendedCalories}` : 'e.g. 2000'} />
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  You can accept the recommendation above or enter your own value.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="diet_type">Diet type</label>
                <input id="diet_type" name="diet_type" type="text" className="form-input"
                  placeholder="e.g. vegan, keto, balanced"
                  value={form.diet_type} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* ── Notifications ────────────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Notification Preferences</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="notification_preferences">Preferences (JSON)</label>
                <textarea
                  id="notification_preferences"
                  name="notification_preferences"
                  rows={3}
                  className="form-textarea"
                  placeholder='e.g. {"email": true, "push": false}'
                  value={form.notification_preferences}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#16A34A', fontSize: '0.9rem' }}>
              ✓ {success}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
