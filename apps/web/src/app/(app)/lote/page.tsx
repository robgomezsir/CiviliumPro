"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UploadPlanilha } from "@/components/dominio/upload-planilha";
import { useIniciarLote } from "@/hooks/mutations/use-iniciar-lote";
import type { PessoaPlanilha } from "@civilium/shared";

export default function LotePage() {
  const router = useRouter();
  const iniciarLote = useIniciarLote();

  const handlePlanilha = async (
    nomeArquivo: string,
    pessoas: PessoaPlanilha[],
  ) => {
    try {
      const result = await iniciarLote.mutateAsync({ nomeArquivo, pessoas });
      toast.success("Lote criado com sucesso");
      router.push(`/lote/${result.loteId}?pessoa=1`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar lote",
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nova pesquisa</h1>
        <p className="text-slate-600">
          Cole a lista do Excel na tabela abaixo ou importe um CSV para iniciar
          as consultas na Receita Federal.
        </p>
      </div>
      <UploadPlanilha
        onPlanilhaValidada={handlePlanilha}
        isLoading={iniciarLote.isPending}
      />
    </div>
  );
}
