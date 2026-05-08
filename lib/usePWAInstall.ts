"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

/**
 * PWA install state hook.
 *
 * - Captures `beforeinstallprompt` on Android Chrome/Edge so we can fire
 *   the native install dialog from our own button.
 * - Detects iOS Safari (no programmatic install support — Apple blocks it).
 *   For those users we show a Share → Add to Home Screen instruction modal
 *   instead of triggering anything automatically.
 * - Detects standalone (already installed) via display-mode media query
 *   plus the iOS-specific `navigator.standalone` flag, so the button
 *   hides itself once the user has added the app.
 */
export function usePWAInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    setIsIOS(iOS);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithStandalone).standalone === true;
    setInstalled(standalone);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install(): Promise<"accepted" | "dismissed" | "ios-instructions" | "unavailable"> {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return outcome;
    }
    if (isIOS) return "ios-instructions";
    return "unavailable";
  }

  return {
    mounted,
    installed,
    isIOS,
    canPromptDirectly: !!deferred,
    install,
    /** Whether the install button should be visible at all. */
    available: mounted && !installed && (!!deferred || isIOS),
  };
}
