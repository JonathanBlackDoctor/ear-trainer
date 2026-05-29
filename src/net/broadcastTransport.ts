import type { BattleMessage, PlayerInfo } from '../battle/types';
import type { BattleTransport } from './transport';

// Backend-free transport built on the BroadcastChannel API. It connects
// multiple tabs of the SAME browser, which is enough to play and test battles
// locally without configuring Supabase. Presence is maintained with periodic
// heartbeats and expiry, mirroring what a hosted realtime service gives us.

type Envelope =
  | { kind: 'msg'; from: string; payload: BattleMessage }
  | { kind: 'ping'; player: PlayerInfo }
  | { kind: 'leave'; id: string }
  | { kind: 'hello' }; // asks existing members to re-announce themselves

const HEARTBEAT_MS = 1500;
const EXPIRY_MS = 4500;

export class BroadcastChannelTransport implements BattleTransport {
  readonly selfId: string;
  private channel: BroadcastChannel | null = null;
  private self: PlayerInfo | null = null;
  private msgHandlers = new Set<(msg: BattleMessage, fromId: string) => void>();
  private presenceHandlers = new Set<(players: PlayerInfo[]) => void>();
  private roster = new Map<string, { player: PlayerInfo; lastSeen: number }>();
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private reaper: ReturnType<typeof setInterval> | null = null;

  constructor(selfId: string) {
    this.selfId = selfId;
  }

  async connect(roomId: string, self: PlayerInfo): Promise<void> {
    this.self = self;
    this.channel = new BroadcastChannel(`ear-trainer-battle:${roomId}`);
    this.channel.onmessage = (e: MessageEvent<Envelope>) => this.handle(e.data);

    // Seed roster with self, announce, and ask others to announce back.
    this.roster.set(self.id, { player: self, lastSeen: Date.now() });
    this.post({ kind: 'hello' });
    this.post({ kind: 'ping', player: self });
    this.emitPresence();

    this.heartbeat = setInterval(() => {
      if (this.self) this.post({ kind: 'ping', player: this.self });
    }, HEARTBEAT_MS);
    this.reaper = setInterval(() => this.reap(), HEARTBEAT_MS);
  }

  send(msg: BattleMessage): void {
    this.post({ kind: 'msg', from: this.selfId, payload: msg });
  }

  on(handler: (msg: BattleMessage, fromId: string) => void): () => void {
    this.msgHandlers.add(handler);
    return () => this.msgHandlers.delete(handler);
  }

  onPresence(handler: (players: PlayerInfo[]) => void): () => void {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  presence(): PlayerInfo[] {
    return [...this.roster.values()].map((r) => r.player);
  }

  disconnect(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.reaper) clearInterval(this.reaper);
    this.heartbeat = this.reaper = null;
    if (this.channel) {
      this.post({ kind: 'leave', id: this.selfId });
      this.channel.close();
      this.channel = null;
    }
    this.roster.clear();
    this.msgHandlers.clear();
    this.presenceHandlers.clear();
  }

  // ─── internals ──────────────────────────────────────────────────────────────
  private post(env: Envelope): void {
    this.channel?.postMessage(env);
  }

  private handle(env: Envelope): void {
    switch (env.kind) {
      case 'hello':
        if (this.self) this.post({ kind: 'ping', player: this.self });
        break;
      case 'ping': {
        const had = this.roster.has(env.player.id);
        this.roster.set(env.player.id, { player: env.player, lastSeen: Date.now() });
        if (!had) this.emitPresence();
        break;
      }
      case 'leave':
        if (this.roster.delete(env.id)) this.emitPresence();
        break;
      case 'msg':
        if (env.from === this.selfId) return; // ignore our own echoes
        this.msgHandlers.forEach((h) => h(env.payload, env.from));
        break;
    }
  }

  private reap(): void {
    const now = Date.now();
    let changed = false;
    for (const [id, rec] of this.roster) {
      if (id !== this.selfId && now - rec.lastSeen > EXPIRY_MS) {
        this.roster.delete(id);
        changed = true;
      }
    }
    if (changed) this.emitPresence();
  }

  private emitPresence(): void {
    const list = this.presence();
    this.presenceHandlers.forEach((h) => h(list));
  }
}
