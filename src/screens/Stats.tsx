import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { useStore } from '../store/useStore';
import { topWeakItems, weaknessScore } from '../engine/weakness';
import type { ModeKey } from '../types';

const MODE_LABELS: Record<ModeKey, string> = {
  interval: '음정',
  chord: '코드',
  progression: '코드 진행',
  melody: '멜로디',
  solfege: '계명',
  transpose: '조옮김',
  rhythm: '리듬',
  tempo: '템포 유지',
  bpm: 'BPM 맞히기',
  lab: '실험실',
  'lab-scale': '스케일 식별',
  'lab-cadence': '종지 식별',
  'lab-key': '조성 식별',
  'lab-inversion': '자리바꿈',
};

export function Stats() {
  const navigate = useNavigate();
  const { stats, sessions } = useStore();

  const totalSessions = sessions.length;
  const totalQ = sessions.reduce((s, ss) => s + ss.total, 0);
  const totalC = sessions.reduce((s, ss) => s + ss.correct, 0);
  const overallPct = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

  // Recent sessions for line chart
  const recentSessions = sessions
    .slice(0, 20)
    .reverse()
    .map((s, i) => ({
      idx: i + 1,
      pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      mode: MODE_LABELS[s.mode] ?? s.mode,
    }));

  // Mode accuracy bars
  const modeAccuracy = (Object.entries(stats) as [ModeKey, typeof stats[ModeKey]][]).map(([mode, ms]) => {
    const items = Object.values(ms);
    const att = items.reduce((s, i) => s + i.attempts, 0);
    const cor = items.reduce((s, i) => s + i.correct, 0);
    return {
      mode: MODE_LABELS[mode],
      pct: att > 0 ? Math.round((cor / att) * 100) : 0,
      attempts: att,
    };
  }).filter((m) => m.attempts > 0);

  // Top weak items
  const allWeakItems = (Object.entries(stats) as [ModeKey, typeof stats[ModeKey]][]).flatMap(([mode, ms]) =>
    Object.entries(ms).map(([key, item]) => ({
      key,
      mode: MODE_LABELS[mode],
      score: weaknessScore(item),
      attempts: item.attempts,
      pct: item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0,
    }))
  ).sort((a, b) => b.score - a.score).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost focus-ring" onClick={() => navigate('/')} aria-label="홈으로 돌아가기">← 뒤로</button>
          <h1 className="font-semibold text-slate-700">📊 통계</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">
        {/* Summary */}
        <div className="card">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">{overallPct}%</div>
              <div className="text-xs text-slate-500 mt-0.5">전체 정답률</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-700">{totalSessions}</div>
              <div className="text-xs text-slate-500 mt-0.5">세션</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-700">{totalQ}</div>
              <div className="text-xs text-slate-500 mt-0.5">총 문제</div>
            </div>
          </div>
        </div>

        {/* Session trend */}
        {recentSessions.length > 1 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">세션별 정답률 추이</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={recentSessions}>
                <XAxis dataKey="idx" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  formatter={(v) => [`${v}%`, '정답률']}
                  labelFormatter={(l) => `세션 ${l}`}
                />
                <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mode accuracy */}
        {modeAccuracy.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">모드별 정답률</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={modeAccuracy} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="mode" tick={{ fontSize: 11 }} width={55} />
                <Tooltip formatter={(v) => [`${v}%`, '정답률']} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {modeAccuracy.map((m, i) => (
                    <Cell
                      key={i}
                      fill={m.pct >= 80 ? '#10b981' : m.pct >= 60 ? '#3b82f6' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weak items */}
        {allWeakItems.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 text-sm">⚠️ 약점 TOP {allWeakItems.length}</h3>
            </div>
            <div className="space-y-2">
              {allWeakItems.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate">{w.key}</span>
                      <span className="text-xs text-slate-400 ml-2">{w.mode}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${Math.min(w.score * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {w.pct}% ({w.attempts}회)
                  </div>
                </div>
              ))}
            </div>
            {allWeakItems.length > 0 && (
              <button
                className="w-full btn-secondary mt-4 text-sm"
                onClick={() => navigate(`/train/${
                  (Object.entries(stats) as [ModeKey, any][])
                    .find(([, ms]) => Object.keys(ms).includes(allWeakItems[0].key))?.[0] ?? 'interval'
                }`)}
              >
                약점 집중 복습 시작 →
              </button>
            )}
          </div>
        )}

        {totalQ === 0 && (
          <div className="card text-center py-10">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-slate-500">아직 기록이 없어요. 훈련을 시작해보세요!</div>
            <button className="btn-primary mt-4" onClick={() => navigate('/')}>훈련 시작</button>
          </div>
        )}
      </div>
    </div>
  );
}
