import type { RealtimeChannel } from '@supabase/supabase-js';
import type { BattleMessage, PlayerInfo } from '../battle/types';
import type { BattleTransport } from './transport';
import { getSupabase } from './supabaseClient';

// Supabase Realtime transport: one channel per room provides both Broadcast
// (fire-and-forget room messages) and Presence (auto-tracked roster). No
// database tables or RLS are needed for this broadcast-only design — the
// unguessable room code is the room's shared secret.

interface PresenceMeta {
  id: string;
  nick: string;
  joinedAt: number;
}

export class SupabaseTransport implements BattleTransport {
  readonly selfId: string;
  private channel: RealtimeChannel | null = null;
  private self: PlayerInfo | null = null;
  private msgHandlers = new Set<(msg: BattleMessage, fromId: string) => void>();
  private presenceHandlers = new Set<(players: PlayerInfo[]) => void>();
  private roster: PlayerInfo[] = [];

  constructor(selfId: string) {
    this.selfId = selfId;
  }

  async connect(roomId: string, self: PlayerInfo): Promise<void> {
    this.self = self;
    const supabase = getSupabase();
    const channel = supabase.channel(`battle:${roomId}`, {
      config: {
        presence: { key: self.id },
        broadcast: { self: false, ack: false },
      },
    });
    this.channel = channel;

    channel.on('broadcast', { event: 'msg' }, ({ payload }) => {
      const from = (payload?.__from as string) ?? '';
      if (from === this.selfId) return;
      this.msgHandlers.forEach((h) => h(payload as BattleMessage, from));
    });

    channel.on('presence', { event: 'sync' }, () => {
      this.syncPresence();
    });

    await new Promise<void>((resolve, reject) => {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ id: self.id, nick: self.nick, joinedAt: self.joinedAt });
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reject(new Error(`Supabase channel ${status}`));
        }
      });
    });
  }

  send(msg: BattleMessage): void {
    this.channel?.send({ type: 'broadcast', event: 'msg', payload: { ...msg, __from: this.selfId } });
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
    return this.roster;
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      getSupabase().removeChannel(this.channel);
      this.channel = null;
    }
    this.msgHandlers.clear();
    this.presenceHandlers.clear();
    this.roster = [];
  }

  private syncPresence(): void {
    if (!this.channel) return;
    const state = this.channel.presenceState<PresenceMeta>();
    const players: PlayerInfo[] = [];
    for (const key of Object.keys(state)) {
      const metas = state[key];
      const meta = metas?.[0];
      if (meta) players.push({ id: meta.id, nick: meta.nick, joinedAt: meta.joinedAt });
    }
    this.roster = players;
    this.presenceHandlers.forEach((h) => h(players));
  }
}
