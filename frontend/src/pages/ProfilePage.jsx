import { useState, useEffect } from 'react';
import { getMe, updateMe } from '../services/usersApi';

const GOAL_OPTIONS = [
  { value: '',            label: '— select —' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'maintain',    label: 'Maintain weight' },
  { value: 'gain_muscle', label: 'Gain muscle' },
];

const EMPTY_FORM = {
  username: '', email: '', weight: '', goal: '',
  diet_type: '', calorie_target: '', notification_preferences: '',
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
            ? JSON.stringify(u.notification_preferences) : '',
        });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

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

  if (loading) return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading profile…
    </div>
  );

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
          {/* Account info */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Account</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input id="username" name="username" type="text" className="form-input" value={form.username} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="form-input" value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email cannot be changed.</p>
              </div>
            </div>
          </div>

          {/* Nutrition goals */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Nutrition Goals</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (kg)</label>
                  <input id="weight" name="weight" type="number" min="0" step="0.1" className="form-input" value={form.weight} onChange={handleChange} placeholder="e.g. 70" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="calorie_target">Daily calorie target (kcal)</label>
                  <input id="calorie_target" name="calorie_target" type="number" min="0" className="form-input" value={form.calorie_target} onChange={handleChange} placeholder="e.g. 2000" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="goal">Goal</label>
                <select id="goal" name="goal" className="form-select" value={form.goal} onChange={handleChange}>
                  {GOAL_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="diet_type">Diet type</label>
                <input id="diet_type" name="diet_type" type="text" className="form-input" placeholder="e.g. vegan, keto, balanced" value={form.diet_type} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Notifications */}
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
