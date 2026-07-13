"use client";

import * as React from "react";
import { Bell, BellOff } from "lucide-react";

export function PushToggle() {
  const [enabled, setEnabled] = React.useState(false);
  const [supported, setSupported] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    setSupported(isSupported);
    if (isSupported && Notification.permission === "granted") {
      setEnabled(true);
    }
  }, []);

  const handleToggle = async () => {
    if (!supported) return;
    setLoading(true);

    try {
      if (!enabled) {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setLoading(false);
          return;
        }

        // Register service worker and get subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BPlaceholderKey",
        });

        // Send subscription to server
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });

        setEnabled(true);
      } else {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        await fetch("/api/notifications/subscribe", { method: "DELETE" });
        setEnabled(false);
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title={enabled ? "Desativar notificações" : "Ativar notificações"}
    >
      {enabled ? (
        <Bell className="h-3.5 w-3.5 text-teal-500" />
      ) : (
        <BellOff className="h-3.5 w-3.5" />
      )}
      <span>{enabled ? "Notificações ativas" : "Ativar notificações"}</span>
    </button>
  );
}
