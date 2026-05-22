import React from 'react';
import { useToast, type ToastItem } from '../store/useToast';

const KIND_CLASS: Record<ToastItem['kind'], string> = {
  info:    'bg-white border-canvas-200 text-primary-900',
  success: 'bg-success-50 border-success-500 text-success-700',
  error:   'bg-danger-50 border-danger-500 text-danger-700',
};

const KIND_ICON: Record<ToastItem['kind'], string> = {
  info: 'ℹ️',
  success: '✓',
  error: '!',
};

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-center gap-3 border-2 rounded-xl shadow-lifted px-4 py-3 text-sm font-medium animate-slide-up motion-reduce:animate-none ${KIND_CLASS[t.kind]}`}
        >
          <span aria-hidden className="text-lg leading-none">{KIND_ICON[t.kind]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={() => dismiss(t.id)}
            className="text-xs opacity-50 hover:opacity-100 px-2 py-1 rounded transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
