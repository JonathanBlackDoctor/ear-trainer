import React from 'react';
import { MODE_ACCENT_CLASS } from '../../../modes/registry';
import type { HomeData } from '../useHomeData';

// Classic (default) look — the original Home layout, unchanged. Data now comes
// from useHomeData so every direction shares one source of truth.
export function HomeDefault({ data }: { data: HomeData }) {
  const {
    rank, totalXp, overallPct, totalSessions, totalQuestions,
    modes, weakItems, recentAchievements,
    startMode, startWeakSession, goStats, goSettings, goBadges,
  } = data;

  return (
    <div className="min-h-screen pb-10">
      <header className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        <div className="max-w-lg mx-auto px-5 pt-8 pb-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-accent-300 text-xs font-semibold tracking-widest uppercase mb-2">
              <span className="inline-block w-6 h-px bg-accent-300"></span>
              Ear Training
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight">음감 훈련</h1>
            <p className="text-sm text-primary-200 mt-2">매일 5분, 자라나는 음감</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-full px-3 py-1.5 text-sm font-medium focus-ring"
              onClick={goStats}
              aria-label="통계 화면 열기"
            >
              <span aria-hidden>📊</span> 통계
            </button>
            <button
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-full px-3 py-1.5 text-sm font-medium focus-ring"
              onClick={goSettings}
              aria-label="설정 화면 열기"
            >
              <span aria-hidden>⚙️</span> 설정
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 -mt-6 space-y-5">
        {totalXp > 0 && (
          <button
            type="button"
            onClick={goBadges}
            className="w-full card-hero animate-slide-up text-left active:scale-[0.99] transition-transform"
            aria-label="업적 화면 열기"
          >
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
                  {totalXp.toLocaleString()}
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
                  <span className="tabular-nums">{rank.xpToNext} XP → {rank.next.name}</span>
                </div>
              </>
            )}
          </button>
        )}

        {recentAchievements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-3 animate-slide-up">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">최근 획득 업적</h2>
              <button className="text-xs text-primary-600 font-semibold hover:text-primary-700" onClick={goBadges}>
                전체 →
              </button>
            </div>
            <div className="flex gap-2">
              {recentAchievements.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={goBadges}
                  className="flex-1 flex flex-col items-center gap-1 bg-accent-50 border border-accent-200 rounded-lg px-2 py-2 active:scale-95 transition-transform"
                  title={a.description}
                  aria-label={`${a.name} 업적`}
                >
                  <span className="text-2xl" aria-hidden>{a.emoji}</span>
                  <span className="text-[10px] font-semibold text-accent-800 text-center leading-tight">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {totalSessions > 0 && (
          <div className="card-hero animate-slide-up">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border-r border-canvas-200">
                <div className="hero-number text-display-sm">
                  {overallPct}<span className="text-2xl text-primary-400">%</span>
                </div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">전체 정답률</div>
              </div>
              <div className="border-r border-canvas-200">
                <div className="font-display text-display-sm font-bold text-slate-700 tabular-nums">{totalSessions}</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">세션 수</div>
              </div>
              <div>
                <div className="font-display text-display-sm font-bold text-slate-700 tabular-nums">{totalQuestions}</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium">총 문제</div>
              </div>
            </div>
          </div>
        )}

        {totalSessions === 0 && (
          <div className="card-hero text-center animate-slide-up">
            <div className="text-4xl mb-2">🎼</div>
            <h2 className="font-display text-xl font-bold text-primary-900 mb-1">훈련을 시작해보세요</h2>
            <p className="text-sm text-slate-500">아래에서 원하는 훈련을 선택하면 됩니다</p>
          </div>
        )}

        {weakItems.length > 0 && (
          <div className="bg-accent-50 border border-accent-200 rounded-2xl shadow-soft p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-accent-800 text-sm flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-500 text-white text-xs">!</span>
                보강이 필요한 항목
              </h2>
              <button className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors" onClick={goStats}>
                전체 보기 →
              </button>
            </div>
            <div className="space-y-1.5">
              {weakItems.map((w) => (
                <button
                  key={w.key + w.mode}
                  className="w-full flex items-center justify-between text-sm bg-white/60 rounded-lg px-3 py-2 hover:bg-white active:scale-95 transition-all focus-ring text-left"
                  onClick={() => startWeakSession(w.mode)}
                  aria-label={`${w.key} 약점 집중 연습 시작`}
                >
                  <span className="text-slate-700 font-medium flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{w.mode}</span>
                    <span>{w.key}</span>
                  </span>
                  <span className="text-accent-700 font-semibold tabular-nums text-xs flex items-center gap-1">
                    약점 {Math.round(w.score * 100)}점
                    <span aria-hidden>→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-slate-500 mb-3 px-1 uppercase tracking-wider">훈련 선택</h2>
          <div className="grid grid-cols-2 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.key}
                className={`mode-card ${MODE_ACCENT_CLASS[mode.key] ?? 'accent-interval'}`}
                onClick={() => startMode(mode.key)}
              >
                <div className="text-3xl mb-2 mt-1">{mode.emoji}</div>
                <div className="font-semibold text-primary-900 text-sm leading-tight">{mode.name}</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">{mode.description}</div>
                {mode.pct !== null ? (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary-600 tabular-nums">{mode.pct}%</span>
                    <div className="flex-1 h-1 bg-canvas-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${mode.pct}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-400 font-medium">아직 기록 없음</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
