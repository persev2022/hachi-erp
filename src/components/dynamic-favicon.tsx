"use client";

import * as React from "react";

/**
 * Dynamically sets the favicon based on the tenant's logo.
 * Falls back to the default favicon if no tenant logo is available.
 */
export function DynamicFavicon() {
  React.useEffect(() => {
    fetch("/api/platform/branding")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.logo) {
          const link =
            (document.querySelector('link[rel="icon"]') as HTMLLinkElement) ||
            document.createElement("link");
          link.type = "image/png";
          link.rel = "icon";
          link.href = d.data.logo;
          document.head.appendChild(link);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
