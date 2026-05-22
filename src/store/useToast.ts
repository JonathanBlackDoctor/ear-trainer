// Tiny toast/snackbar bus. Components call `useToast.getState().show(...)` or
// the convenience hook returned by `useToast()`. The Toast container subscribes
// for renders. Timers are tracked so a programmatic dismiss cancels them
// cleanly — same pattern as the audio engine's playback-generation guards.

import { create } from 'zustand';

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastStore {
  toasts: ToastItem[];
  show: (message: string, kind?: ToastKind, durationMs?: number) => number;
  dismiss: (id: number) => void;
}

const timers = new Map<number, number>();
let nextId = 1;

export const useToast = create<ToastStore>((set, get) => ({
  toasts: [],
  show: (message, kind = 'info', durationMs = 3000) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    if (durationMs > 0) {
      const handle = window.setTimeout(() => {
        timers.delete(id);
        get().dismiss(id);
      }, durationMs);
      timers.set(id, handle);
    }
    return id;
  },
  dismiss: (id) => {
    const handle = timers.get(id);
    if (handle !== undefined) {
      window.clearTimeout(handle);
      timers.delete(id);
    }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  info:    (m: string, d?: number) => useToast.getState().show(m, 'info',    d),
  success: (m: string, d?: number) => useToast.getState().show(m, 'success', d),
  error:   (m: string, d?: number) => useToast.getState().show(m, 'error',   d),
};
