"use client";

import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { AvisoExtensao } from "@/components/dominio/aviso-extensao";
import { PainelLotesCrud } from "@/components/dominio/painel-lotes-crud";
import { Button } from "@/components/ui/button";

export default function PainelPage() {
  return (
    <div className="space-y-6">
      <AvisoExtensao />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
          <p className="text-slate-600">
            Gerencie os lotes de verificação cadastral pesquisados
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/lote">
            <IconPlus className="h-5 w-5" />
            Nova planilha
          </Link>
        </Button>
      </div>

      <PainelLotesCrud />
    </div>
  );
}
