"use client";

import { useEffect, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { pingExtensao } from "@/lib/extensao-bridge";

export function AvisoExtensao() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    pingExtensao().then(setOnline);
  }, []);

  if (online !== false) return null;

  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <IconInfoCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">Extensão Civilium Bridge necessária</p>
        <p className="mt-1 text-amber-900">
          Para consultar a Receita Federal, instale a extensão Chrome da pasta{" "}
          <code className="rounded bg-amber-100 px-1">apps/extension</code> em{" "}
          <code className="rounded bg-amber-100 px-1">chrome://extensions</code>{" "}
          e configure o <code className="rounded bg-amber-100 px-1">config.js</code>{" "}
          com o mesmo segredo do servidor.
        </p>
      </div>
    </div>
  );
}
