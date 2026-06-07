"use client";

import { useEffect, useState } from "react";
import { IconPlugConnected, IconPlugConnectedX } from "@tabler/icons-react";
import { pingExtensao } from "@/lib/extensao-bridge";

export function StatusExtensao() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      const ok = await pingExtensao();
      if (ativo) setOnline(ok);
    }

    verificar();
    const intervalo = window.setInterval(verificar, 30_000);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  if (online === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
        Verificando extensão...
      </span>
    );
  }

  if (online) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-civilium-accent/20 px-2.5 py-1 text-xs font-medium text-civilium-accent-dark">
        <IconPlugConnected className="h-3.5 w-3.5" />
        Bridge ativa
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900"
      title="Instale a extensão Civilium Bridge em chrome://extensions"
    >
      <IconPlugConnectedX className="h-3.5 w-3.5" />
      Extensão não detectada
    </span>
  );
}
