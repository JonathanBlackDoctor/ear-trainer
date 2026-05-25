import { useStore } from '../store/useStore';
import type { DesignTheme } from '../types';

// Active visual direction, read straight from the persisted setting. Mirrors the
// selector pattern in hooks/useThemeSync.ts so components only re-render when the
// chosen theme changes. Screen resolvers use this to pick a per-direction shell.
export function useDesign(): DesignTheme {
  return useStore((s) => s.settings.design ?? 'default');
}
