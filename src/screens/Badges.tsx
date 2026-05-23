import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ACHIEVEMENTS, type AchievementCategory } from '../engine/achievements';
import { rankFor, RANK_TIERS } from '../engine/xp';

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  volume: '누적',
  streak: '연속',
  mastery: '숙련',
  completion: '도전',
  speed: '속도',
  weakness: '약점 정복',
};

const CATEGORY_ORDER: AchievementCategory[] = [
  'volume', 'streak', 'mastery', 'completion', 'speed', 'weakness',
];

export function Badges() {
  const navigate = useNavigate();
  const { gamification } = useStore();
  const rank = rankFor(gamification.totalXp);
  const unlocked = gamification.achievements;
  const unlockedCount = Object.keys(unlocked).length;

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: ACHIEVEMENTS.filter((a) => a.category === cat),
  }));

  return (
    <div className="min-h-screen pb-10">
      <header className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost py-1 px-2 text-sm" onClick={() => navigate('/')}>← 홈</button>
          <h1 className="font-semibold text-slate-700">업적 & 등급</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-5">
        {/* Rank card */}
        <div className="card-hero">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">현재 등급</div>
              <div className="font-display text-2xl font-bold text-primary-900 mt-0.5">
                {rank.tier.emoji} {rank.tier.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">누적 XP</div>
              <div className="font-display text-2xl font-bold text-primary-900 tabular-nums">
                {gamification.totalXp.toLocaleString()}
              </div>
            </div>
          </div>
          {rank.next && (
            <>
              <div className="mt-3 h-2 bg-canvas-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${rank.progress * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                <span>{rank.tier.name}</span>
                <span className="tabular-nums">{rank.xpToNext} XP 남음 → {rank.next.name}</span>
              </div>
            </>
          )}
          {!rank.next && (
            <div className="mt-3 text-xs text-accent-700 font-semibold text-center">
              👑 최고 등급에 도달했어요!
            </div>
          )}
        </div>

        {/* Rank tiers strip */}
        <div className="card">
          <div className="text-xs font-semibold text-slate-600 mb-2">등급표</div>
          <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
            {RANK_TIERS.map((t) => {
              const reached = gamification.totalXp >= t.min;
              return (
                <div
                  key={t.id}
                  className={`rounded-md border p-1.5 ${
                    reached
                      ? 'border-primary-200 bg-primary-50 text-primary-800'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="text-base leading-none">{t.emoji}</div>
                  <div className="font-semibold mt-0.5">{t.name}</div>
                  <div className="tabular-nums opacity-70">{t.min}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement count */}
        <div className="text-center text-sm text-slate-500">
          업적 <span className="font-bold text-primary-700 tabular-nums">{unlockedCount}</span> / {ACHIEVEMENTS.length} 달성
        </div>

        {/* Achievement grid by category */}
        {byCategory.map(({ cat, items }) => (
          <div key={cat}>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 px-1">
              {CATEGORY_LABEL[cat]}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {items.map((a) => {
                const isUnlocked = !!unlocked[a.id];
                return (
                  <div
                    key={a.id}
                    className={`card p-3 ${
                      isUnlocked
                        ? 'border-accent-200'
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    <div className="text-3xl text-center" aria-hidden>{a.emoji}</div>
                    <div className="text-sm font-bold text-center mt-1 text-slate-800">
                      {isUnlocked ? a.name : '???'}
                    </div>
                    <div className="text-[11px] text-center text-slate-500 mt-1 leading-snug">
                      {isUnlocked ? a.description : '미해제'}
                    </div>
                    {isUnlocked && (
                      <div className="text-[10px] text-center text-slate-400 mt-1.5 tabular-nums">
                        {new Date(unlocked[a.id].unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
