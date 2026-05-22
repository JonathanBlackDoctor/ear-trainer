import { useEffect, useState, useCallback } from 'react';

// Chrome/Edge가 발화하는 beforeinstallprompt 이벤트 타입.
// 표준화되지 않아 lib.dom.d.ts에는 없으므로 직접 선언한다.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt: BeforeInstallPromptEvent | null;
  }
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari는 display-mode 미디어쿼리 대신 navigator.standalone을 쓴다.
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const mq = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  return mq || iosStandalone;
}

function detectIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  // iPadOS 13+는 'Mac'으로 보고되므로 터치 지원 여부도 함께 확인.
  const iPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOS;
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(
    typeof window !== 'undefined' && !!window.__pwaDeferredPrompt,
  );
  const [isStandalone, setIsStandalone] = useState<boolean>(detectStandalone);
  const isIOS = detectIOS();

  useEffect(() => {
    function onAvailable() {
      setCanInstall(true);
    }
    function onInstalled() {
      setCanInstall(false);
      setIsStandalone(true);
    }
    const dm = window.matchMedia?.('(display-mode: standalone)');
    const onDisplayChange = () => setIsStandalone(detectStandalone());

    window.addEventListener('pwa-install-available', onAvailable);
    window.addEventListener('pwa-installed', onInstalled);
    dm?.addEventListener?.('change', onDisplayChange);

    return () => {
      window.removeEventListener('pwa-install-available', onAvailable);
      window.removeEventListener('pwa-installed', onInstalled);
      dm?.removeEventListener?.('change', onDisplayChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const ev = window.__pwaDeferredPrompt;
    if (!ev) return 'unavailable';
    await ev.prompt();
    const { outcome } = await ev.userChoice;
    // 한 번 사용한 이벤트는 재사용 불가 — 정리한다.
    window.__pwaDeferredPrompt = null;
    setCanInstall(false);
    return outcome;
  }, []);

  return { canInstall, isStandalone, isIOS, promptInstall };
}
