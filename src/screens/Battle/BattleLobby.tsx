import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBattleStore } from '../../store/useBattleStore';
import { useBattle } from '../../battle/useBattle';
import { BATTLE_MODES, maxLevelFor } from '../../battle/modes';
import { QUESTION_COUNT_OPTIONS, DEFAULT_BATTLE_CONFIG } from '../../battle/types';
import { MODE_REGISTRY } from '../../modes/registry';
import { useToast } from '../../store/useToast';
import type { ModeKey } from '../../types';

export function BattleLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const { startBattle, leaveBattle } = useBattle();
  const roster = useBattleStore((s) => s.roster);
  const selfId = useBattleStore((s) => s.selfId);
  const hostId = useBattleStore((s) => s.hostId);
  const phase = useBattleStore((s) => s.phase);
  const isHost = hostId !== null && hostId === selfId;

  const [mode, setMode] = useState<ModeKey>('interval');
  const [level, setLevel] = useState(1);
  const [count, setCount] = useState<number>(DEFAULT_BATTLE_CONFIG.questionCount);

  const ready = roster.length >= 2;
  const maxLevel = maxLevelFor(mode);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      useToast.getState().show('초대 링크를 복사했어요', 'success');
    } catch {
      useToast.getState().show('복사에 실패했어요', 'error');
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId ?? '');
      useToast.getState().show('코드를 복사했어요', 'success');
    } catch {
      useToast.getState().show('복사에 실패했어요', 'error');
    }
  };

  const onStart = () => {
    startBattle({ mode, level: Math.min(level, maxLevel), questionCount: count, perQuestionMs: DEFAULT_BATTLE_CONFIG.perQuestionMs });
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost py-1 px-2 text-sm focus-ring" onClick={leaveBattle}>← 나가기</button>
          <span className="font-semibold text-slate-700">⚔️ 대기실</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Room code */}
        <div className="card text-center space-y-3">
          <div className="text-sm text-slate-500">방 코드</div>
          <div className="text-4xl font-mono font-bold tracking-[0.3em] text-primary-700">{roomId}</div>
          <div className="flex gap-2 justify-center">
            <button className="btn-secondary px-4 py-2 text-sm" onClick={copyCode}>코드 복사</button>
            <button className="btn-secondary px-4 py-2 text-sm" onClick={copyLink}>링크 복사</button>
          </div>
          <div className="text-xs text-slate-400">친구에게 코드나 링크를 보내 같은 방에 입장하게 하세요</div>
        </div>

        {/* Roster */}
        <div className="card space-y-2">
          <div className="text-sm font-semibold text-slate-600">참가자 ({roster.length}/2)</div>
          {roster.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-slate-700">
              <span>{p.id === hostId ? '👑' : '🎮'}</span>
              <span className="font-medium">{p.nick}</span>
              {p.id === selfId && <span className="text-xs text-slate-400">(나)</span>}
            </div>
          ))}
          {!ready && <div className="text-sm text-slate-400">상대를 기다리는 중...</div>}
        </div>

        {/* Host config + start */}
        {isHost ? (
          <div className="card space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">모드</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus-ring"
                value={mode}
                onChange={(e) => { setMode(e.target.value as ModeKey); setLevel(1); }}
              >
                {BATTLE_MODES.map((m) => (
                  <option key={m} value={m}>{MODE_REGISTRY[m].emoji} {MODE_REGISTRY[m].name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">난이도 Lv{level}</label>
              <input
                type="range" min={1} max={maxLevel} step={1} value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">문제 수</label>
              <div className="flex gap-2">
                {QUESTION_COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm ${count === n ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    onClick={() => setCount(n)}
                  >
                    {n}문제
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full py-3" onClick={onStart} disabled={!ready || phase !== 'lobby'}>
              {ready ? '대결 시작!' : '상대 대기 중...'}
            </button>
          </div>
        ) : (
          <div className="card text-center text-slate-500">
            👑 호스트가 대결을 시작하기를 기다리는 중...
          </div>
        )}
      </div>
    </div>
  );
}
