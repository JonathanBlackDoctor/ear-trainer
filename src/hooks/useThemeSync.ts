import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { DesignTheme } from '../types';

// PWA / browser-chrome color per theme (matches each direction's token).
const THEME_COLOR: Record<DesignTheme, string> = {
  default: '#3730a3',
  g: '#ff5a8c',
  i: '#65a30d',
  j: '#ff3da8',
  m: '#a855f7',
};

/**
 * Applies the persisted `design` setting to the document: sets
 * `<html data-theme="...">` (which re-skins every themed CSS variable) and
 * keeps the `<meta name="theme-color">` in sync so the mobile browser chrome
 * / PWA splash matches the active theme.
 */
export function useThemeSync(): void {
  const design = useStore((s) => s.settings.design);

  useEffect(() => {
    const theme: DesignTheme = design ?? 'default';
    const root = document.documentElement;
    if (theme === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLOR[theme] ?? THEME_COLOR.default;
  }, [design]);
}
