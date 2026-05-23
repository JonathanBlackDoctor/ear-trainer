import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Remembers the scroll position per route so that returning to a screen
// (back / home / exit) lands where the user left off instead of the top.
const positions = new Map<string, number>();

export function ScrollRestoration() {
  const { pathname } = useLocation();

  // useLayoutEffect (not useEffect): the cleanup must detach the scroll
  // listener synchronously during the commit — before the browser reflows the
  // now-shorter page and fires a clamp-to-0 scroll event that would otherwise
  // overwrite the saved position. We never read scrollY in the cleanup for the
  // same reason; the listener already holds the last real position.
  useLayoutEffect(() => {
    const saved = positions.get(pathname) ?? 0;

    // Content is lazy-loaded, so the page may still be laying out on the first
    // frame. Retry for a few frames until the saved offset is reachable.
    let frame = 0;
    let tries = 0;
    let restoring = true;
    const restore = () => {
      window.scrollTo(0, saved);
      tries += 1;
      if (saved > 0 && window.scrollY !== saved && tries < 10) {
        frame = requestAnimationFrame(restore);
      } else {
        restoring = false;
      }
    };
    frame = requestAnimationFrame(restore);

    // Ignore scroll events while programmatically restoring so a transient
    // clamped value can't overwrite the saved position.
    const onScroll = () => {
      if (!restoring) positions.set(pathname, window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  return null;
}
