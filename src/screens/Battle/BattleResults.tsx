import { useBattleStore } from '../../store/useBattleStore';
import { useBattle } from '../../battle/BattleProvider';

export function BattleResults() {
  const { voteRematch, leaveBattle } = useBattle();
  const results = useBattleStore((s) => s.results);
  const selfId = useBattleStore((s) => s.selfId);
  const roster = useBattleStore((s) => s.roster);
  const rematchVotes = useBattleStore((s) => s.rematchVotes);

  if (!results) return null;

  const isWin = results.winnerId === selfId;
  const isDraw = results.winnerId === null;
  const title = results.byForfeit
    ? '🏆 부전승!'
    : isDraw ? '🤝 무승부' : isWin ? '🎉 승리!' : '😢 패배';

  // Display players from results.done (fallback to roster for nicks).
  const nickOf = (id: string) => results.players.find((p) => p.id === id)?.nick
    ?? roster.find((p) => p.id === id)?.nick ?? '플레이어';

  const ranked = Object.values(results.done).sort((a, b) =>
    b.score - a.score || a.correctMs - b.correctMs);

  const selfVoted = rematchVotes[selfId];
  const voteCount = roster.filter((p) => rematchVotes[p.id]).length;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 py-8 space-y-6 flex-1">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-800 mb-1">{title}</div>
        </div>

        <div className="card space-y-3">
          {ranked.map((d, i) => {
            const isSelf = d.playerId === selfId;
            const isWinner = d.playerId === results.winnerId;
            return (
              <div
                key={d.playerId}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 border ${isWinner ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className="text-xl font-bold text-slate-400 w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-700">
                    {isWinner && '👑 '}{nickOf(d.playerId)}{isSelf && ' (나)'}
                  </div>
                  <div className="text-xs text-slate-400">정답 {d.correct}개</div>
                </div>
                <div className="text-2xl font-bold tabular-nums text-slate-800">{d.score}</div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <button
            className="btn-primary w-full py-3"
            onClick={voteRematch}
            disabled={selfVoted}
          >
            {selfVoted ? `재대결 대기 중... (${voteCount}/${roster.length})` : '🔁 재대결'}
          </button>
          <button className="btn-ghost w-full" onClick={leaveBattle}>
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
