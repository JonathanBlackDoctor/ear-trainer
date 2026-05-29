import React from 'react';
import type { ResultData } from '../useResultData';
import { formatItemKey } from '../../../modes/itemLabels';

// Classic (default) Result layout — unchanged from the original screen.
export function ResultDefault({ data }: { data: ResultData }) {
  const {
    mode, pct, emoji, comment, correct, wrong, mins, secs, bestCombo,
    xpEarned, xpDisplayed, totalXp, currRank, prevRank, rankedUp,
    unlocked, wrongItems, weakProgress, again, goBadges, goStats, goHome,
  } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <h1 className="max-w-lg mx-auto font-semibold text-slate-700">세션 결과</h1>
      </div>

      <div className="flex-1 max-w-lg mx-auto px-4 py-6 space-y-5 w-full">
        {rankedUp && (
          <div className="bg-gradient-to-br from-accent-100 to-accent-200 border-2 border-accent-400 rounded-2xl p-4 text-center animate-bounce-in motion-reduce:animate-none">
            <div className="text-3xl">🎊</div>
            <div className="text-xs uppercase tracking-wider text-accent-700 font-semibold mt-1">랭크 업!</div>
            <div className="font-display text-2xl font-bold text-accent-900 mt-0.5">
              {currRank.tier.emoji} {currRank.tier.name}
            </div>
            <div className="text-xs text-accent-800 mt-1">
              {prevRank.tier.name} → {currRank.tier.name}
            </div>
          </div>
        )}

        {xpEarned > 0 && (
          <div className="card-hero text-center">
            <div className="text-[10px] uppercase tracking-wider text-accent-700 font-semibold">획득 XP</div>
            <div className="font-display text-display-sm font-bold text-accent-700 tabular-nums mt-1">+{xpDisplayed}</div>
            <div className="mt-3 text-xs text-slate-500">
              누적 <span className="font-semibold tabular-nums text-primary-700">{totalXp.toLocaleString()}</span> XP
              {' · '}
              <span className="font-semibold">{currRank.tier.emoji} {currRank.tier.name}</span>
            </div>
            {currRank.next && (
              <div className="mt-2 h-1.5 bg-canvas-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700" style={{ width: `${currRank.progress * 100}%` }} />
              </div>
            )}
            {currRank.next && (
              <div className="mt-1 text-[10px] text-slate-400 tabular-nums">다음 {currRank.next.name}까지 {currRank.xpToNext} XP</div>
            )}
          </div>
        )}

        <div className="card text-center py-8">
          <div className="text-6xl mb-3">{emoji}</div>
          <div className="text-5xl font-bold text-primary-600">{pct}%</div>
          <div className="text-slate-500 mt-1">{comment}</div>
          <div className="flex justify-center gap-8 mt-6 text-center">
            <div>
              <div className="text-xl font-bold text-emerald-600">{correct}</div>
              <div className="text-xs text-slate-400">정답</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">{wrong}</div>
              <div className="text-xs text-slate-400">오답</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-600">{mins > 0 ? `${mins}분 ` : ''}{secs}초</div>
              <div className="text-xs text-slate-400">소요 시간</div>
            </div>
          </div>
          {bestCombo >= 3 && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full px-3 py-1">
              🔥 최고 콤보 {bestCombo}연속
            </div>
          )}
        </div>

        {unlocked.length > 0 && (
          <div className="card border-accent-200 bg-accent-50">
            <div className="text-xs uppercase tracking-wider text-accent-700 font-semibold mb-2">새로 획득한 업적 · {unlocked.length}개</div>
            <div className="space-y-2">
              {unlocked.map((a) => (
                <div key={a.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-accent-200">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800">{a.name}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {weakProgress.length > 0 && (
          <div className="card border-accent-200 bg-accent-50">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">⚡ 약점 개선</h3>
            <div className="space-y-1.5">
              {weakProgress.map((w) => {
                const delta = w.beforePct != null && w.afterPct != null ? w.afterPct - w.beforePct : null;
                const deltaColor = delta == null ? 'text-slate-400' : delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-slate-400';
                return (
                  <div key={w.itemKey} className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-600">{formatItemKey(mode, w.itemKey)}</span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="text-slate-400 text-xs">{w.beforePct ?? '–'}% → {w.afterPct ?? '–'}%</span>
                      <span className={`text-xs font-semibold ${deltaColor}`}>
                        {delta == null ? '' : delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : '—'}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {wrongItems.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">틀린 문항 항목</h3>
            <div className="space-y-1">
              {wrongItems.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-600">{formatItemKey(mode, r.itemKey)}</span>
                  <span className="text-red-500 text-xs">
                    {r.skipped ? '건너뜀' : r.partialScore > 0 ? `${Math.round(r.partialScore * 100)}%` : '오답'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button className="w-full btn-primary" onClick={again}>한 번 더</button>
          <button className="w-full btn-secondary" onClick={goBadges}>🏆 업적 보기</button>
          <button className="w-full btn-secondary" onClick={goStats}>📊 통계 보기</button>
          <button className="w-full btn-ghost text-slate-500" onClick={goHome}>홈으로</button>
        </div>
      </div>
    </div>
  );
}
