// Aggressively check for service-worker updates whenever the PWA comes to
// foreground. The default vite-plugin-pwa autoUpdate flow only checks on
// navigation — and HashRouter never causes a real navigation — so installed
// users would stay on the cached build indefinitely between deploys.
//
// Flow:
//   1. On every visibilitychange → visible (throttled), call `registration.update()`.
//   2. If a new SW is found, it installs and (because autoUpdate sets
//      skipWaiting + clientsClaim in the generated sw.js) takes over.
//   3. `controllerchange` fires → reload the page to pick up the new bundle.
//      Stats, XP, and settings survive because they're in localStorage.

// Don't hammer the SW check on rapid tab-switches; cap to once per minute.
const UPDATE_THROTTLE_MS = 60_000;

// Reloading mid-session would lose the user's in-flight question state (the
// active session lives in React state, not the store). When the new SW lands
// while the user is on /train/..., wait until they leave before reloading.
function isOnTrainingScreen(): boolean {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#/train/');
}

export function setupSwUpdateOnForeground(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    if (isOnTrainingScreen()) {
      // Defer the reload until the user navigates away from the session.
      const onHashChange = () => {
        if (!isOnTrainingScreen()) {
          window.removeEventListener('hashchange', onHashChange);
          window.location.reload();
        }
      };
      window.addEventListener('hashchange', onHashChange);
      return;
    }
    // setTimeout(0) lets any in-flight React commit settle before the reload.
    setTimeout(() => window.location.reload(), 0);
  });

  let lastCheck = 0;
  const checkForUpdate = (): void => {
    const now = Date.now();
    if (now - lastCheck < UPDATE_THROTTLE_MS) return;
    lastCheck = now;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.update())
      .catch(() => {
        // Network failures or SW-not-found shouldn't crash the app.
      });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  // Cover the case where the page was already visible before this listener
  // attached (i.e. the very first load).
  if (document.visibilityState === 'visible') checkForUpdate();
}
