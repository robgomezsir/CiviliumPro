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
        <p className="font-medium">Extensão civilium bridge necessária</p>
        <p className="mt-1 text-amber-900">
          Para consultar a Receita Federal, instale a extensão{" "}
          <strong>civilium bridge</strong> no Chrome e configure em{" "}
          <strong>Opções da extensão</strong> a URL do civilium e a chave de
          integração fornecida pelo administrador.
        </p>
      </div>
    </div>
  );
}
