import React, { useState } from 'react';
import { useDesign } from '../theme/useDesign';
import { G, I, J, M } from '../theme/decorations/palette';
import { Oscilloscope } from '../theme/decorations/grid';
import { JReel } from '../theme/decorations/cassette';

interface PlaybackControlsProps {
  onPlay: (speed: number) => void;
  onPlayReference?: () => void;
  showReference?: boolean;
  loading?: boolean;
}

interface VariantProps {
  play: () => void;
  speed: 1 | 0.5;
  toggleSpeed: () => void;
  onPlayReference?: () => void;
  showReference: boolean;
  loading: boolean;
}

export function PlaybackControls({ onPlay, onPlayReference, showReference = false, loading = false }: PlaybackControlsProps) {
  const design = useDesign();
  const [speed, setSpeed] = useState<1 | 0.5>(1);
  const v: VariantProps = {
    play: () => onPlay(speed),
    speed,
    toggleSpeed: () => setSpeed((s) => (s === 1 ? 0.5 : 1)),
    onPlayReference,
    showReference,
    loading,
  };

  switch (design) {
    case 'g': return <PlayG {...v} />;
    case 'i': return <PlayI {...v} />;
    case 'j': return <PlayJ {...v} />;
    case 'm': return <PlayM {...v} />;
    default: return <PlayDefault {...v} />;
  }
}

function PlayDefault({ play, speed, toggleSpeed, onPlayReference, showReference, loading }: VariantProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {showReference && onPlayReference && (
        <button className="btn-ghost flex items-center gap-1.5 text-slate-500" onClick={onPlayReference} disabled={loading}>
          <span className="text-xl">🎹</span>
          <span className="text-sm">기준음</span>
        </button>
      )}
      <button className="btn-primary flex items-center gap-2 px-8" onClick={play} disabled={loading}>
        {loading ? <span className="animate-spin text-xl">⏳</span> : <span className="text-xl">▶</span>}
        <span>듣기</span>
      </button>
      <button
        className={`btn-secondary flex items-center gap-1.5 ${speed === 0.5 ? 'border-primary-400 text-primary-700 bg-primary-50' : ''}`}
        onClick={toggleSpeed}
        title="느리게/빠르게 전환"
      >
        <span className="text-lg">{speed === 1 ? '🐢' : '🐇'}</span>
        <span className="text-sm">{speed === 1 ? '느리게' : '보통'}</span>
      </button>
    </div>
  );
}

function PlayG({ play, speed, toggleSpeed, onPlayReference, showReference, loading }: VariantProps) {
  return (
    <div style={{ background: G.mustard, border: G.border, boxShadow: G.shadow, padding: '18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {showReference && onPlayReference && (
          <button onClick={onPlayReference} disabled={loading} aria-label="기준음" style={{ width: 56, height: 56, border: `2.5px solid ${G.ink}`, background: G.card, fontSize: 22, boxShadow: '3px 3px 0 #0a0a0a' }}>🎹</button>
        )}
        <button onClick={play} disabled={loading} style={{ flex: 1, height: 64, border: `3px solid ${G.ink}`, background: G.pink, color: G.ink, fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', boxShadow: '4px 4px 0 #0a0a0a' }}>
          {loading ? '⏳ …' : '▶  듣기'}
        </button>
        <button onClick={toggleSpeed} aria-label="속도" style={{ width: 56, height: 56, border: `2.5px solid ${G.ink}`, background: speed === 0.5 ? G.mint : G.card, fontSize: 20, boxShadow: '3px 3px 0 #0a0a0a' }}>{speed === 1 ? '🐢' : '🐇'}</button>
      </div>
    </div>
  );
}

function PlayI({ play, speed, toggleSpeed, onPlayReference, showReference, loading }: VariantProps) {
  const mono: React.CSSProperties = { fontVariantNumeric: 'tabular-nums slashed-zero', letterSpacing: 1 };
  return (
    <div style={{ background: I.card, border: `1px solid ${I.hairDark}`, padding: '10px 12px' }}>
      <div style={{ ...mono, fontSize: 10, fontWeight: 800, color: I.inkMute, letterSpacing: 1.5, marginBottom: 6 }}>SCOPE · 듣기</div>
      <Oscilloscope />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={play} disabled={loading} style={{ ...mono, flex: 1, padding: '12px 0', border: `1.5px solid ${I.ink}`, background: I.ink, color: I.lime, fontSize: 13, fontWeight: 800 }}>
          {loading ? '⏳ PLAY' : '▶ PLAY / 듣기'}
        </button>
        {showReference && onPlayReference && (
          <button onClick={onPlayReference} disabled={loading} style={{ ...mono, padding: '12px 14px', border: `1px solid ${I.hairDark}`, background: I.card, color: I.ink, fontSize: 12, fontWeight: 800 }}>🎹 REF</button>
        )}
        <button onClick={toggleSpeed} style={{ ...mono, padding: '12px 14px', border: `1px solid ${I.hairDark}`, background: speed === 0.5 ? I.limeSoft : I.card, color: I.ink, fontSize: 12, fontWeight: 800 }}>{speed === 1 ? '0.5×' : '1.0×'}</button>
      </div>
    </div>
  );
}

function PlayJ({ play, speed, toggleSpeed, onPlayReference, showReference, loading }: VariantProps) {
  return (
    <div style={{ background: J.chrome, border: `2.5px solid ${J.ink}`, boxShadow: `4px 4px 0 ${J.ink}`, padding: 12 }}>
      {/* tape window with reels (spin while playing) */}
      <div style={{ background: '#2a1c2f', border: `2px solid ${J.ink}`, borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <JReel size={36} hubColor={J.pink} spinning={loading} />
        <div style={{ flex: 1, height: 3, background: loading ? J.pink : J.teal, margin: '0 10px' }} />
        <JReel size={36} hubColor={J.teal} spinning={loading} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {showReference && onPlayReference && (
          <button onClick={onPlayReference} disabled={loading} style={{ padding: '10px 12px', border: `2px solid ${J.ink}`, background: J.card, color: J.ink, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>🎹 REF</button>
        )}
        <button onClick={play} disabled={loading} style={{ flex: 1, padding: '10px 0', border: `2px solid ${J.ink}`, background: J.pink, color: '#fff', fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>{loading ? '⏳ PLAY' : '▶ PLAY'}</button>
        <button onClick={toggleSpeed} style={{ padding: '10px 12px', border: `2px solid ${J.ink}`, background: speed === 0.5 ? J.yellow : J.card, color: J.ink, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>{speed === 1 ? '🐢' : '🐇'}</button>
      </div>
    </div>
  );
}

function PlayM({ play, speed, toggleSpeed, onPlayReference, showReference, loading }: VariantProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
      <div style={{ position: 'relative', width: 144, height: 144 }}>
        <div aria-hidden style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: M.iridescent, opacity: 0.6, filter: 'blur(20px)' }} />
        <button
          onClick={play}
          disabled={loading}
          aria-label="듣기"
          style={{ position: 'relative', width: 144, height: 144, borderRadius: '50%', border: 'none', background: M.iridescent, color: '#fff', fontSize: 48, boxShadow: '0 20px 50px rgba(168,85,247,0.55), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -8px 16px rgba(26,31,58,0.15)' }}
        >
          {loading ? '⏳' : '▶'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {showReference && onPlayReference && (
          <button onClick={onPlayReference} disabled={loading} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', color: M.inkSoft, fontSize: 12, fontWeight: 700 }}>🎹 기준음</button>
        )}
        <button onClick={toggleSpeed} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.9)', background: speed === 0.5 ? M.iridescentSoft : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', color: M.inkSoft, fontSize: 12, fontWeight: 700 }}>{speed === 1 ? '🐢 느리게' : '🐇 보통'}</button>
      </div>
    </div>
  );
}
