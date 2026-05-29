import type { BattleMessage, PlayerInfo } from '../battle/types';

// Single seam between the battle feature and whatever realtime backend is in
// use. The rest of the app depends only on this interface, so the backend can
// be swapped (Supabase ⇄ self-hosted WS) without touching screens/store.

export interface BattleTransport {
  readonly selfId: string;
  /** Join a room and start tracking presence as `self`. */
  connect(roomId: string, self: PlayerInfo): Promise<void>;
  /** Broadcast a message to everyone else in the room. */
  send(msg: BattleMessage): void;
  /** Subscribe to inbound messages. Returns an unsubscribe fn. */
  on(handler: (msg: BattleMessage, fromId: string) => void): () => void;
  /** Current room roster (including self). */
  presence(): PlayerInfo[];
  /** Subscribe to roster changes. Returns an unsubscribe fn. */
  onPresence(handler: (players: PlayerInfo[]) => void): () => void;
  /** Leave the room and release resources. */
  disconnect(): void;
}

/** True when Supabase env vars are configured (production realtime backend). */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

/**
 * Create the appropriate transport. Uses Supabase Realtime when configured;
 * otherwise falls back to a BroadcastChannel transport that connects multiple
 * tabs in the SAME browser — enough to play/test locally with no backend.
 *
 * Both implementations are lazy-imported so their code (and the Supabase SDK)
 * stays out of the main bundle until a battle actually starts.
 */
export async function createTransport(selfId: string): Promise<BattleTransport> {
  if (hasSupabaseConfig()) {
    const { SupabaseTransport } = await import('./supabaseTransport');
    return new SupabaseTransport(selfId);
  }
  const { BroadcastChannelTransport } = await import('./broadcastTransport');
  return new BroadcastChannelTransport(selfId);
}
