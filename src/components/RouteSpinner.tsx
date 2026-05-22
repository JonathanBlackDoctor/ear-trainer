import React from 'react';

/** Lightweight fallback for lazy-loaded route chunks. Uses brand tokens only. */
export function RouteSpinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="화면을 불러오는 중"
      className="min-h-screen bg-canvas-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin motion-reduce:animate-none" />
        <span className="text-xs text-slate-500 font-medium">불러오는 중…</span>
      </div>
    </div>
  );
}
