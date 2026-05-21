import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ModeKey, SessionResult } from '../types';

interface ResultState {
  mode: ModeKey;
  total: number;
  correct: number;
  results: SessionResult[];
  durationSec: number;
}

export function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;

  if (!state) {
    navigate('/');
    return null;
  }

  const { mode, total, correct, results, durationSec } = state;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;

  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚';
  const comment = pct >= 90 ? '완벽합니다!' : pct >= 70 ? '잘 하셨어요!' : pct >= 50 ? '계속 연습해보세요!' : '약점을 집중 훈련해봐요!';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-lg mx-auto font-semibold text-slate-700">세션 결과</div>
      </div>

      <div className="flex-1 max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Score card */}
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
              <div className="text-xl font-bold text-red-500">{total - correct}</div>
              <div className="text-xs text-slate-400">오답</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-600">
                {mins > 0 ? `${mins}분 ` : ''}{secs}초
              </div>
              <div className="text-xs text-slate-400">소요 시간</div>
            </div>
          </div>
        </div>

        {/* Wrong items */}
        {results.filter((r) => !r.correct).length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">틀린 문항 항목</h3>
            <div className="space-y-1">
              {results
                .filter((r) => !r.correct)
                .map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-slate-600">{r.itemKey}</span>
                    <span className="text-red-500 text-xs">
                      {r.skipped ? '건너뜀' : r.partialScore > 0 ? `${Math.round(r.partialScore * 100)}%` : '오답'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            className="w-full btn-primary"
            onClick={() => navigate(`/train/${mode}`)}
          >
            한 번 더
          </button>
          <button
            className="w-full btn-secondary"
            onClick={() => navigate('/stats')}
          >
            📊 통계 보기
          </button>
          <button
            className="w-full btn-ghost text-slate-500"
            onClick={() => navigate('/')}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
