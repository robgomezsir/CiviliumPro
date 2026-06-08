"use client";

import { useEffect } from "react";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Falha silenciosa — PWA opcional em desenvolvimento local
    });
  }, []);

  return (
    <>
      {children}
      <PwaInstallBanner />
    </>
  );
}
