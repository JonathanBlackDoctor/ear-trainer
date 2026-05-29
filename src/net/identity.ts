// Anonymous, device-local player identity for online battles.
//
// We deliberately avoid any account system (see the feature plan): a stable
// random player id and an editable nickname are persisted in localStorage,
// kept entirely separate from the main ear-trainer store so the offline
// single-player experience and its migration pipeline are untouched.

const ID_KEY = 'ear-trainer-battle-id';
const NICK_KEY = 'ear-trainer-battle-nick';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I

function randomString(len: number): string {
  let out = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const buf = new Uint32Array(len);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  } else {
    for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** A stable per-device id, generated once and reused for every battle. */
export function getPlayerId(): string {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = 'p_' + randomString(10);
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage disabled: fall back to an ephemeral id.
    return 'p_' + randomString(10);
  }
}

/** A friendly default nickname like "Player-7Q2K". */
export function defaultNick(): string {
  return 'Player-' + randomString(4);
}

/** The user's saved nickname, or null if they have not set one yet. */
export function getNick(): string | null {
  try {
    return localStorage.getItem(NICK_KEY);
  } catch {
    return null;
  }
}

/** Persist the user's chosen nickname (trimmed, capped at 16 chars). */
export function setNick(nick: string): string {
  const clean = nick.trim().slice(0, 16) || defaultNick();
  try {
    localStorage.setItem(NICK_KEY, clean);
  } catch {
    /* ignore storage failures */
  }
  return clean;
}
