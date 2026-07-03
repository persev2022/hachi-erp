"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Session timeout component.
 * Logs user out after 15 minutes of inactivity.
 * Resets timer on any mouse/keyboard/touch activity.
 */
export function SessionTimeout() {
  const router = useRouter();
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      // Logout
      try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
      router.push("/login?expired=1");
    }, TIMEOUT_MS);
  }, [router]);

  React.useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer(); // Start initial timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return null; // Invisible component
}
