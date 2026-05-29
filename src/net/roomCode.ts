// Short, shareable room codes for private 1v1 battles (Jackbox-style).
// The unguessable code is the room's shared secret — anyone with the code can
// join the channel, which is the intended trust model for casual play.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
export const ROOM_CODE_LENGTH = 6;

/** Generate a random 6-character room code. */
export function generateRoomCode(): string {
  let out = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const buf = new Uint32Array(ROOM_CODE_LENGTH);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  } else {
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Uppercase and strip anything outside the code alphabet (paste-friendly). */
export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .split('')
    .filter((c) => ALPHABET.includes(c))
    .join('')
    .slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(raw: string): boolean {
  return normalizeRoomCode(raw).length === ROOM_CODE_LENGTH;
}
