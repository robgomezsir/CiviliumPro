import { Suspense } from "react";
import { LoteConsultaClient } from "./lote-consulta-client";

export const maxDuration = 60;

type Props = {
  params: Promise<{ loteId: string }>;
};

export default async function LoteDetalhePage({ params }: Props) {
  const { loteId } = await params;

  return (
    <Suspense fallback={<p className="text-slate-600">Carregando...</p>}>
      <LoteConsultaClient loteId={loteId} />
    </Suspense>
  );
}
