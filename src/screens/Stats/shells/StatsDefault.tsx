import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import type { StatsData } from '../useStatsData';
import { formatItemKey } from '../../../modes/itemLabels';

export function StatsDefault({ data }: { data: StatsData }) {
  const { overallPct, totalSessions, totalQ, trend, modeAccuracy, weakItems, goHome, startWeakFocus } = data;
  const trendData = trend.map((pct, i) => ({ idx: i + 1, pct }));
  const barData = modeAccuracy.map((m) => ({ mode: m.label, pct: m.pct }));

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost focus-ring" onClick={goHome} aria-label="홈으로 돌아가기">← 뒤로</button>
          <h1 className="font-semibold text-slate-700">📊 통계</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">
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

        {trendData.length > 1 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">세션별 정답률 추이</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trendData}>
                <XAxis dataKey="idx" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, '정답률']} labelFormatter={(l) => `세션 ${l}`} />
                <Line type="monotone" dataKey="pct" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {barData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">모드별 정답률</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="mode" tick={{ fontSize: 11 }} width={55} />
                <Tooltip formatter={(v) => [`${v}%`, '정답률']} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {barData.map((m, i) => (
                    <Cell key={i} fill={m.pct >= 80 ? '#10b981' : m.pct >= 60 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {weakItems.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 text-sm">⚠️ 약점 TOP {weakItems.length}</h3>
            </div>
            <div className="space-y-2">
              {weakItems.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate">{formatItemKey(w.modeKey, w.key)}</span>
                      <span className="text-xs text-slate-400 ml-2">{w.modeLabel}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(w.score * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">{w.pct}% ({w.attempts}회)</div>
                </div>
              ))}
            </div>
            <button className="w-full btn-secondary mt-4 text-sm" onClick={startWeakFocus}>약점 집중 복습 시작 →</button>
          </div>
        )}

        {totalQ === 0 && (
          <div className="card text-center py-10">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-slate-500">아직 기록이 없어요. 훈련을 시작해보세요!</div>
            <button className="btn-primary mt-4" onClick={goHome}>훈련 시작</button>
          </div>
        )}
      </div>
    </div>
  );
}
