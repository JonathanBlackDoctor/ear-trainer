import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Remembers the scroll position per route so that returning to a screen
// (back / home / exit) lands where the user left off instead of the top.
const positions = new Map<string, number>();

export function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    const saved = positions.get(pathname) ?? 0;

    // Content is lazy-loaded, so the page may still be laying out on the first
    // frame. Retry for a few frames until the saved offset is reachable.
    let frame = 0;
    let tries = 0;
    const restore = () => {
      window.scrollTo(0, saved);
      tries += 1;
      if (saved > 0 && window.scrollY !== saved && tries < 8) {
        frame = requestAnimationFrame(restore);
      }
    };
    frame = requestAnimationFrame(restore);

    const onScroll = () => positions.set(pathname, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      positions.set(pathname, window.scrollY);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  return null;
}
