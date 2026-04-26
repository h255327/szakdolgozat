import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { getMealHistory } from '../services/mealsApi';

const PERIODS = [7, 14, 30];

const GOAL_LABELS = {
  lose_weight: 'Lose weight',
  gain_muscle: 'Gain muscle',
  maintain:    'Maintain weight',
};

function fmtDate(iso) {
  const [, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[Number(m) - 1]} ${Number(d)}`;
}

// Returns a goal-aware feedback object based on average daily calorie difference.
// avgDiff < 0  → deficit (consumed < target)
// avgDiff > 0  → surplus (consumed > target)
// Thresholds mirror the backend onTrack logic in progressCalculator.js.
function buildFeedback(goal, avgDiff, calorieTarget, hasData) {
  if (!hasData) return null;

  if (!goal || !calorieTarget) {
    return {
      tone:     'neutral',
      icon:     '💡',
      headline: 'Set up your profile to get personalized feedback.',
      detail:   !goal
        ? 'Add a goal (lose weight, gain muscle, or maintain) in your profile settings.'
        : 'Add a calorie target in your profile to unlock goal-based feedback.',
    };
  }

  // Maintain: on-track window is ±10% of target (matches backend)
  const maintainWindow = calorieTarget * 0.10;

  if (goal === 'lose_weight') {
    if (avgDiff <= -50)
      return {
        tone:     'good',
        icon:     '✅',
        headline: 'You are currently on track for weight loss.',
        detail:   `You are averaging ${Math.abs(avgDiff)} kcal below your daily target — a consistent deficit like this adds up over time.`,
      };
    if (avgDiff <= 100)
      return {
        tone:     'neutral',
        icon:     '📊',
        headline: 'You are very close to your calorie target.',
        detail:   'Even a small, consistent deficit will support weight loss gradually. You are nearly there.',
      };
    return {
      tone:     'caution',
      icon:     '📌',
      headline: 'You are above your target this period.',
      detail:   `Your average intake is ${avgDiff} kcal over your target. Bringing it a little lower will help move you toward your weight loss goal.`,
    };
  }

  if (goal === 'gain_muscle') {
    if (avgDiff >= 50)
      return {
        tone:     'good',
        icon:     '✅',
        headline: 'You are on track for muscle gain.',
        detail:   `You are averaging ${avgDiff} kcal above your target — a calorie surplus like this supports muscle building alongside your training.`,
      };
    if (avgDiff >= -100)
      return {
        tone:     'neutral',
        icon:     '📊',
        headline: 'Your intake is close to your calorie target.',
        detail:   'A small, consistent surplus will better support muscle growth. You are very close to that range.',
      };
    return {
      tone:     'caution',
      icon:     '📌',
      headline: 'You are below your calorie target this period.',
      detail:   `Your average intake is ${Math.abs(avgDiff)} kcal under your target. Eating a bit more will better support your muscle-building goal.`,
    };
  }

  if (goal === 'maintain') {
    if (Math.abs(avgDiff) <= maintainWindow)
      return {
        tone:     'good',
        icon:     '✅',
        headline: 'Your intake is close to your maintenance goal.',
        detail:   'You are staying well within your target range — that kind of consistency is exactly what maintenance takes.',
      };
    if (avgDiff > maintainWindow)
      return {
        tone:     'caution',
        icon:     '📌',
        headline: 'You are a bit above your maintenance target.',
        detail:   `Your average intake is ${avgDiff} kcal over your target this period. Staying a little closer to your target will help maintain your weight.`,
      };
    return {
      tone:     'caution',
      icon:     '📌',
      headline: 'You are a bit below your maintenance target.',
      detail:   `Your average intake is ${Math.abs(avgDiff)} kcal under your target this period. Staying a little closer to your target will help maintain your weight.`,
    };
  }

  return null;
}

const TONE_COLORS = {
  good:    '#10B981',
  neutral: '#3B82F6',
  caution: '#F97316',
};

function SummaryCard({ label, value, color, sub }) {
  return (
    <div className="macro-card">
      <div className="macro-value" style={{ color }}>{value}</div>
      <div className="macro-label">{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  );
}

function ProgressPage() {
  const [days, setDays]     = useState(7);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMealHistory(days)
      .then(({ data }) => setResult(data))
      .catch(() => setError('Failed to load progress data.'))
      .finally(() => setLoading(false));
  }, [days]);

  const allDays     = result?.data || [];
  const loggedDays  = allDays.filter(d => d.caloriesConsumed > 0);
  const hasData     = loggedDays.length > 0;
  const judgedDays  = allDays.filter(d => d.onTrack !== null).length;
  const onTrackDays = allDays.filter(d => d.onTrack === true).length;

  const avgCalories = hasData
    ? Math.round(loggedDays.reduce((s, d) => s + d.caloriesConsumed, 0) / loggedDays.length)
    : null;

  const avgDiff = hasData
    ? Math.round(loggedDays.reduce((s, d) => s + d.calorieDifference, 0) / loggedDays.length)
    : null;

  const lastDay         = allDays[allDays.length - 1];
  const cumDiff         = lastDay?.cumulativeDifference ?? null;
  const estWeightChange = lastDay?.estimatedWeightChangeKg ?? null;

  const calorieTarget  = result?.calorie_target || 0;
  const goal           = result?.goal || null;
  const startingWeight = result?.starting_weight ?? null;
  const showWeightLine = startingWeight !== null;

  const chartData = allDays.map(d => ({ ...d, dateLabel: fmtDate(d.date) }));

  const diffColor = avgDiff != null && avgDiff <= 0 ? '#10B981' : '#F97316';
  const cumColor  = cumDiff != null && cumDiff <= 0  ? '#10B981' : '#F97316';
  const wcColor   =
    estWeightChange === null ? 'var(--text-muted)' :
    goal === 'lose_weight'   ? (estWeightChange <= 0 ? '#10B981' : '#EF4444') :
    goal === 'gain_muscle'   ? (estWeightChange >= 0 ? '#10B981' : '#EF4444') :
    '#3B82F6';

  const adherencePct = judgedDays > 0 ? Math.round((onTrackDays / judgedDays) * 100) : 0;
  const feedback     = buildFeedback(goal, avgDiff, calorieTarget, hasData);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Progress</h1>
          {goal && (
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Goal: {GOAL_LABELS[goal] || goal}
              {calorieTarget > 0 && ` · ${calorieTarget} kcal/day target`}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className={`btn btn-sm ${days === p ? 'btn-primary' : 'btn-secondary'}`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error   && <p style={{ color: '#EF4444' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          <div className="macro-grid" style={{ marginBottom: '1.5rem' }}>
            <SummaryCard
              label="Avg daily calories"
              value={avgCalories !== null ? String(avgCalories) : '—'}
              color="var(--primary)"
              sub={hasData ? `${loggedDays.length} of ${days} days logged` : 'No data yet'}
            />
            <SummaryCard
              label="Avg daily diff"
              value={avgDiff !== null ? `${avgDiff > 0 ? '+' : ''}${avgDiff}` : '—'}
              color={avgDiff !== null ? diffColor : 'var(--text-muted)'}
              sub="kcal vs target"
            />
            <SummaryCard
              label="Cumulative diff"
              value={cumDiff !== null && hasData ? `${cumDiff > 0 ? '+' : ''}${cumDiff}` : '—'}
              color={cumDiff !== null && hasData ? cumColor : 'var(--text-muted)'}
              sub="kcal total"
            />
            <SummaryCard
              label="Est. weight change"
              value={estWeightChange !== null && hasData ? `${estWeightChange > 0 ? '+' : ''}${estWeightChange} kg` : '—'}
              color={hasData ? wcColor : 'var(--text-muted)'}
              sub={startingWeight ? `from ${startingWeight} kg` : 'set weight in profile'}
            />
          </div>

          {/* Goal-aware feedback message */}
          {feedback && (
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                borderLeft: `4px solid ${TONE_COLORS[feedback.tone]}`,
              }}
            >
              <div className="card-body" style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.4 }}>{feedback.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{feedback.headline}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {feedback.detail}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goal adherence banner */}
          {judgedDays > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {adherencePct >= 80 ? '🎯' : adherencePct >= 50 ? '📈' : '💪'}
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {onTrackDays} / {judgedDays} logged day{judgedDays !== 1 ? 's' : ''} on track
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {adherencePct}% adherence — {GOAL_LABELS[goal] || 'your goal'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div className="progress-wrap" style={{ width: '120px' }}>
                    <div
                      className="progress-bar p-green"
                      style={{ width: `${adherencePct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasData && (
            <div className="card">
              <div className="empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>No meals logged yet</p>
                <p style={{ fontSize: '0.9rem' }}>Start logging meals to see your progress here.</p>
                <Link to="/meals" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                  Log a meal
                </Link>
              </div>
            </div>
          )}

          {hasData && (
            <>
              {/* Bar chart: daily calories vs target */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Daily Calories</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                      <Tooltip
                        formatter={(v) => [`${v} kcal`, 'Calories']}
                        labelStyle={{ fontWeight: 600 }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                      />
                      {calorieTarget > 0 && (
                        <ReferenceLine
                          y={calorieTarget}
                          stroke="#F97316"
                          strokeDasharray="5 3"
                          label={{ value: 'Target', position: 'insideTopRight', fontSize: 11, fill: '#F97316' }}
                        />
                      )}
                      <Bar dataKey="caloriesConsumed" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {chartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              entry.caloriesConsumed === 0 ? '#E5E7EB' :
                              entry.onTrack === true        ? '#10B981' :
                              entry.onTrack === false       ? '#F97316' :
                              '#6366F1'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Green = on track · Orange = off track · Indigo = no goal set · Gray = no data
                  </p>
                </div>
              </div>

              {/* Line chart: estimated weight / weight change */}
              {calorieTarget > 0 && (
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>
                      {showWeightLine ? 'Estimated Weight (kg)' : 'Estimated Weight Change (kg)'}
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                        <Tooltip
                          formatter={(v) => v !== null ? [`${v} kg`, showWeightLine ? 'Weight' : 'Change'] : ['—', '']}
                          labelStyle={{ fontWeight: 600 }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                        />
                        {showWeightLine && startingWeight && (
                          <ReferenceLine
                            y={startingWeight}
                            stroke="#94A3B8"
                            strokeDasharray="5 3"
                            label={{ value: 'Start', position: 'insideTopRight', fontSize: 11, fill: '#94A3B8' }}
                          />
                        )}
                        {!showWeightLine && (
                          <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="5 3" />
                        )}
                        <Line
                          type="monotone"
                          dataKey={showWeightLine ? 'estimatedWeightKg' : 'estimatedWeightChangeKg'}
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#6366F1' }}
                          activeDot={{ r: 5 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Based on logged calories vs target · 7700 kcal ≈ 1 kg estimate
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ProgressPage;
