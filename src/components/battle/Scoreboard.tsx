import { useBattleStore } from '../../store/useBattleStore';

interface Props { total: number }

// Live both-player scoreboard: name, running score, and question progress.
export function Scoreboard({ total }: Props) {
  const roster = useBattleStore((s) => s.roster);
  const selfId = useBattleStore((s) => s.selfId);
  const scores = useBattleStore((s) => s.scores);
  const progress = useBattleStore((s) => s.progress);

  // Self first, then opponent(s).
  const ordered = [...roster].sort((a, b) => (a.id === selfId ? -1 : b.id === selfId ? 1 : 0));

  return (
    <div className="grid grid-cols-2 gap-2">
      {ordered.map((p) => {
        const isSelf = p.id === selfId;
        return (
          <div
            key={p.id}
            className={`rounded-xl px-3 py-2 border ${isSelf ? 'bg-primary-50 border-primary-200' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 truncate">
              <span>{isSelf ? '🟦' : '🟥'}</span>
              <span className="truncate">{p.nick}</span>
            </div>
            <div className="text-2xl font-bold tabular-nums text-slate-800">{scores[p.id] ?? 0}</div>
            <div className="text-xs text-slate-400 tabular-nums">{Math.min(progress[p.id] ?? 0, total)}/{total}</div>
          </div>
        );
      })}
    </div>
  );
}
