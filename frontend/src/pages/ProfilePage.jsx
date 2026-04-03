import { useState, useEffect } from 'react';
import { getMe, updateMe } from '../services/usersApi';

const GOAL_OPTIONS = [
  { value: '',             label: '— select —' },
  { value: 'lose_weight',  label: 'Lose weight' },
  { value: 'maintain',     label: 'Maintain weight' },
  { value: 'gain_muscle',  label: 'Gain muscle' },
];

const EMPTY_FORM = {
  username:                 '',
  email:                    '',
  weight:                   '',
  goal:                     '',
  diet_type:                '',
  calorie_target:           '',
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
          username:                 u.username   ?? '',
          email:                    u.email      ?? '',
          weight:                   u.weight     ?? '',
          goal:                     u.goal       ?? '',
          diet_type:                u.diet_type  ?? '',
          calorie_target:           u.calorie_target ?? '',
          notification_preferences: u.notification_preferences
            ? JSON.stringify(u.notification_preferences)
            : '',
        });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      username:       form.username       || undefined,
      weight:         form.weight         !== '' ? Number(form.weight)         : undefined,
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

  if (loading) return <p>Loading profile…</p>;

  return (
    <div>
      <h1>Profile</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username" name="username" type="text"
            value={form.username} onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email"
            value={form.email} disabled
          />
        </div>

        <div>
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight" name="weight" type="number" min="0" step="0.1"
            value={form.weight} onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="goal">Goal</label>
          <select id="goal" name="goal" value={form.goal} onChange={handleChange}>
            {GOAL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="diet_type">Diet type</label>
          <input
            id="diet_type" name="diet_type" type="text"
            placeholder="e.g. vegan, keto, balanced"
            value={form.diet_type} onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="calorie_target">Daily calorie target (kcal)</label>
          <input
            id="calorie_target" name="calorie_target" type="number" min="0"
            value={form.calorie_target} onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="notification_preferences">
            Notification preferences (JSON)
          </label>
          <textarea
            id="notification_preferences"
            name="notification_preferences"
            rows={3}
            placeholder='e.g. {"email": true, "push": false}'
            value={form.notification_preferences}
            onChange={handleChange}
          />
        </div>

        {error   && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
