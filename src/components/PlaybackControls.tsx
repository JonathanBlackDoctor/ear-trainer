import React, { useState } from 'react';

interface PlaybackControlsProps {
  onPlay: (speed: number) => void;
  onPlayReference?: () => void;
  showReference?: boolean;
  loading?: boolean;
}

export function PlaybackControls({
  onPlay,
  onPlayReference,
  showReference = false,
  loading = false,
}: PlaybackControlsProps) {
  const [speed, setSpeed] = useState<1 | 0.5>(1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {showReference && onPlayReference && (
        <button
          className="btn-ghost flex items-center gap-1.5 text-slate-500"
          onClick={onPlayReference}
          disabled={loading}
        >
          <span className="text-xl">🎹</span>
          <span className="text-sm">기준음</span>
        </button>
      )}

      <button
        className="btn-primary flex items-center gap-2 px-8"
        onClick={() => onPlay(speed)}
        disabled={loading}
      >
        {loading ? (
          <span className="animate-spin text-xl">⏳</span>
        ) : (
          <span className="text-xl">▶</span>
        )}
        <span>듣기</span>
      </button>

      <button
        className={`btn-secondary flex items-center gap-1.5 ${speed === 0.5 ? 'border-primary-400 text-primary-700 bg-primary-50' : ''}`}
        onClick={() => setSpeed(speed === 1 ? 0.5 : 1)}
        title="느리게/빠르게 전환"
      >
        <span className="text-lg">{speed === 1 ? '🐢' : '🐇'}</span>
        <span className="text-sm">{speed === 1 ? '느리게' : '보통'}</span>
      </button>
    </div>
  );
}
