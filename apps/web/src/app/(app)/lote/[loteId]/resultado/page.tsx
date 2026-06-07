import { Suspense } from "react";
import { ResultadoClient } from "./resultado-client";

type Props = {
  params: Promise<{ loteId: string }>;
};

export default async function ResultadoPage({ params }: Props) {
  const { loteId } = await params;

  return (
    <Suspense fallback={<p className="text-slate-600">Carregando...</p>}>
      <ResultadoClient loteId={loteId} />
    </Suspense>
  );
}
