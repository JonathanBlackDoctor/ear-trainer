import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNick, setNick, defaultNick } from '../../net/identity';
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from '../../net/roomCode';
import { hasSupabaseConfig } from '../../net/transport';

export function BattleHome() {
  const navigate = useNavigate();
  const [nick, setNickState] = useState(() => getNick() || defaultNick());
  const [joinCode, setJoinCode] = useState('');

  const saveNick = () => setNick(nick);

  const createRoom = () => {
    saveNick();
    navigate(`/battle/room/${generateRoomCode()}/lobby`);
  };

  const joinRoom = () => {
    saveNick();
    const code = normalizeRoomCode(joinCode);
    if (isValidRoomCode(code)) navigate(`/battle/room/${code}/lobby`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button className="btn-ghost py-1 px-2 text-sm focus-ring" onClick={() => navigate('/')}>← 홈</button>
          <span className="font-semibold text-slate-700">⚔️ 1대1 대결</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Nickname */}
        <div className="card space-y-2">
          <label className="text-sm font-semibold text-slate-600">닉네임</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-base focus-ring"
            value={nick}
            maxLength={16}
            onChange={(e) => setNickState(e.target.value)}
            onBlur={saveNick}
            placeholder="닉네임을 입력하세요"
          />
        </div>

        {/* Create */}
        <button className="btn-primary w-full py-4 text-lg" onClick={createRoom}>
          방 만들기
        </button>

        {/* Join */}
        <div className="card space-y-3">
          <label className="text-sm font-semibold text-slate-600">코드로 입장</label>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-lg font-mono tracking-widest uppercase focus-ring"
              value={joinCode}
              onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
              placeholder="ABC123"
              maxLength={6}
            />
            <button
              className="btn-secondary px-5"
              onClick={joinRoom}
              disabled={!isValidRoomCode(joinCode)}
            >
              입장
            </button>
          </div>
        </div>

        {!hasSupabaseConfig() && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            ⚠️ 온라인 서버(Supabase)가 설정되지 않아 현재는 <b>같은 브라우저의 다른 탭</b>끼리만 대결할 수 있습니다.
            온라인 대결을 켜려면 <code>VITE_SUPABASE_URL</code>/<code>VITE_SUPABASE_ANON_KEY</code> 환경변수를 설정하세요.
          </div>
        )}
      </div>
    </div>
  );
}
