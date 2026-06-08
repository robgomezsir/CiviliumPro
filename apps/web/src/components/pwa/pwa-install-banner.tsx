"use client";

import { IconDownload, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "civilium-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function appJaInstalado() {
  if (typeof window === "undefined") return true;

  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return standalone || iosStandalone;
}

function iosSemInstalar() {
  if (typeof window === "undefined") return false;

  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !appJaInstalado()
  );
}

export function PwaInstallBanner() {
  const [visivel, setVisivel] = useState(false);
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [modoIos, setModoIos] = useState(false);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    if (appJaInstalado()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    setModoIos(iosSemInstalar());
    setVisivel(iosSemInstalar());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisivel(true);
    };

    const onInstalled = () => {
      setVisivel(false);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const fecharSessao = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisivel(false);
  }, []);

  const instalar = useCallback(async () => {
    if (!promptEvent) return;

    setInstalando(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setVisivel(false);
      }
    } finally {
      setInstalando(false);
      setPromptEvent(null);
    }
  }, [promptEvent]);

  if (!visivel) return null;

  return (
    <div
      role="region"
      aria-label="Instalar aplicativo civilium"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-civilium-border bg-civilium-surface/95 px-4 py-3 shadow-[0_-8px_24px_rgba(20,32,51,0.12)] backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Image
            src="/apple-touch-icon.png"
            alt=""
            width={40}
            height={40}
            className="shrink-0 rounded-xl"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">Instale o civilium</p>
            {modoIos && !promptEvent ? (
              <p className="text-sm text-slate-600">
                No Safari, toque em <strong>Compartilhar</strong> e escolha{" "}
                <strong>Adicionar à Tela de Início</strong> para acesso rápido.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Adicione o civilium à sua área de trabalho para consultas mais
                rápidas, como um aplicativo.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          {promptEvent ? (
            <Button size="sm" onClick={instalar} disabled={instalando}>
              <IconDownload className="h-4 w-4" />
              {instalando ? "Instalando..." : "Instalar app"}
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={fecharSessao}>
            Agora não
          </Button>
          <button
            type="button"
            onClick={fecharSessao}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar aviso de instalação"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
