"use client";

import { AvisoExtensao } from "@/components/dominio/aviso-extensao";
import { PainelLotesCrud } from "@/components/dominio/painel-lotes-crud";

export default function PainelPage() {
  return (
    <div className="space-y-6">
      <AvisoExtensao />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="text-slate-600">
          Gerencie os lotes de verificação cadastral pesquisados
        </p>
      </div>

      <PainelLotesCrud />
    </div>
  );
}
