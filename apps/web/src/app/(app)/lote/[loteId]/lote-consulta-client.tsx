"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconArrowRight,
} from "@tabler/icons-react";
import { iniciarConsulta } from "@/actions/consulta/iniciar-consulta.action";
import { pausarLote } from "@/actions/consulta/pausar-lote.action";
import { enviarCaptchaAutomacao } from "@/lib/automacao-client";
import { CaptchaViewer } from "@/components/dominio/captcha-viewer";
import { ProgressoLote } from "@/components/dominio/progresso-lote";
import { TabelaResultados } from "@/components/dominio/tabela-resultados";
import { Button } from "@/components/ui/button";
import { useConsultas } from "@/hooks/queries/use-consultas";
import { useLote } from "@/hooks/queries/use-lote";
import { useRegistrarResultado } from "@/hooks/mutations/use-registrar-resultado";
import { useUrlNumberState } from "@/hooks/use-url-state";

type Props = {
  loteId: string;
};

export function LoteConsultaClient({ loteId }: Props) {
  const router = useRouter();
  const { data: lote, isLoading: loadingLote } = useLote(loteId);
  const { data: consultas, isLoading: loadingConsultas } = useConsultas(loteId);
  const registrarResultado = useRegistrarResultado(loteId);
  const [pessoaIndex, setPessoaIndex] = useUrlNumberState("pessoa", 1);

  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [consultaAtivaId, setConsultaAtivaId] = useState<string | null>(null);
  const [isProcessando, setIsProcessando] = useState(false);
  const [pausado, setPausado] = useState(false);

  const stats = useMemo(() => {
    const rows = consultas ?? [];
    return {
      confere: rows.filter((c) => c.status === "CONFERE").length,
      naoConfere: rows.filter((c) => c.status === "NAO_CONFERE").length,
      erros: rows.filter((c) => c.status === "ERRO").length,
      pendentes: rows.filter(
        (c) => c.status === "PENDENTE" || c.status === "EM_ANDAMENTO",
      ).length,
    };
  }, [consultas]);

  const consultaAtual = useMemo(() => {
    if (!consultas?.length) return null;
    const porOrdem = consultas.find((c) => c.ordemNaLista === pessoaIndex);
    if (porOrdem && (porOrdem.status === "PENDENTE" || porOrdem.status === "EM_ANDAMENTO")) {
      return porOrdem;
    }
    return (
      consultas.find((c) => c.status === "PENDENTE" || c.status === "EM_ANDAMENTO") ??
      null
    );
  }, [consultas, pessoaIndex]);

  const iniciarProximaConsulta = useCallback(async () => {
    if (!consultaAtual || pausado || isProcessando) return;

    setIsProcessando(true);
    setCaptchaImage(null);

    try {
      const result = await iniciarConsulta({
        loteId,
        consultaId: consultaAtual.id,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      setConsultaAtivaId(consultaAtual.id);
      setCaptchaImage(result?.data?.captchaImage ?? null);
      setPessoaIndex(consultaAtual.ordemNaLista);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a consulta",
      );
    } finally {
      setIsProcessando(false);
    }
  }, [consultaAtual, pausado, isProcessando, loteId, setPessoaIndex]);

  useEffect(() => {
    if (!consultas || !lote) return;
    if (lote.status === "CONCLUIDO") {
      router.push(`/lote/${loteId}/resultado`);
      return;
    }
    if (pausado || isProcessando || captchaImage || consultaAtivaId) return;
    if (!consultaAtual) return;
    if (consultaAtual.status === "PENDENTE") {
      void iniciarProximaConsulta();
    }
  }, [
    consultas,
    lote,
    pausado,
    isProcessando,
    captchaImage,
    consultaAtivaId,
    consultaAtual,
    iniciarProximaConsulta,
    loteId,
    router,
  ]);

  const handleConfirmarCaptcha = async (captcha: string) => {
    if (!consultaAtivaId) return;

    setIsProcessando(true);
    try {
      const resultado = await enviarCaptchaAutomacao(loteId, {
        consultaId: consultaAtivaId,
        captcha,
      });

      await registrarResultado.mutateAsync({
        consultaId: consultaAtivaId,
        nomeNaReceita: resultado.nomeNaReceita,
        erroMensagem: resultado.erroMensagem,
      });

      setCaptchaImage(null);
      setConsultaAtivaId(null);

      const restantes =
        consultas?.filter((c) => c.status === "PENDENTE").length ?? 0;

      if (restantes <= 1) {
        toast.success("Lote verificado. Revise os resultados.");
        router.push(`/lote/${loteId}/resultado`);
      } else {
        toast.success("Consulta concluída");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o CAPTCHA",
      );
    } finally {
      setIsProcessando(false);
    }
  };

  const handlePausar = async () => {
    const novoPausado = !pausado;
    try {
      const result = await pausarLote({ loteId, pausado: novoPausado });
      if (result?.serverError) throw new Error(result.serverError);
      setPausado(novoPausado);
      toast.success(novoPausado ? "Lote pausado" : "Lote retomado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível pausar",
      );
    }
  };

  if (loadingLote || loadingConsultas) {
    return <p className="text-slate-600">Carregando lote...</p>;
  }

  if (!lote || !consultas) {
    return <p className="text-red-600">Lote não encontrado</p>;
  }

  const todasVerificadas = stats.pendentes === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lote.nomeArquivo}</h1>
          <p className="text-slate-600">
            {consultaAtual
              ? `Verificando pessoa ${consultaAtual.ordemNaLista} de ${lote.totalPessoas}`
              : "Todas as pessoas foram verificadas"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePausar}
            disabled={todasVerificadas}
          >
            {pausado ? (
              <>
                <IconPlayerPlay className="h-5 w-5" />
                Retomar
              </>
            ) : (
              <>
                <IconPlayerPause className="h-5 w-5" />
                Pausar
              </>
            )}
          </Button>
          {todasVerificadas && (
            <Button size="lg" asChild>
              <Link href={`/lote/${loteId}/resultado`}>
                Ver resultados
                <IconArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <ProgressoLote
        total={lote.totalPessoas}
        consultadas={lote.consultadasCount}
        confere={stats.confere}
        naoConfere={stats.naoConfere}
        erros={stats.erros}
        pendentes={stats.pendentes}
      />

      {!todasVerificadas && !pausado && (
        <CaptchaViewer
          captchaImage={captchaImage}
          isLoading={isProcessando}
          onConfirmar={handleConfirmarCaptcha}
        />
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Fila de verificação
        </h2>
        <TabelaResultados consultas={consultas} somentePendentes />
      </div>
    </div>
  );
}
