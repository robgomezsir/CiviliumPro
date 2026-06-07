"use client";

import { consultaPodeRetentar } from "@civilium/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconArrowRight,
} from "@tabler/icons-react";
import { pausarLote } from "@/actions/consulta/pausar-lote.action";
import { AvisoExtensao } from "@/components/dominio/aviso-extensao";
import { BotaoAbrirPortal } from "@/components/dominio/botao-abrir-portal";
import { ProgressoLote } from "@/components/dominio/progresso-lote";
import { TabelaResultados } from "@/components/dominio/tabela-resultados";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConsultas } from "@/hooks/queries/use-consultas";
import { useLote } from "@/hooks/queries/use-lote";
import { useUrlNumberState } from "@/hooks/use-url-state";

type Props = {
  loteId: string;
};

export function LoteConsultaClient({ loteId }: Props) {
  const { data: lote, isLoading: loadingLote } = useLote(loteId);
  const { data: consultas, isLoading: loadingConsultas } = useConsultas(loteId);
  const [pessoaIndex, setPessoaIndex] = useUrlNumberState("pessoa", 1);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (lote) setPausado(Boolean(lote.pausado));
  }, [lote]);

  useEffect(() => {
    if (!consultas?.length) return;

    const emAndamento = consultas.find((c) => c.status === "EM_ANDAMENTO");
    if (emAndamento) {
      setPessoaIndex(emAndamento.ordemNaLista);
    }
  }, [consultas, setPessoaIndex]);

  const stats = useMemo(() => {
    const rows = consultas ?? [];
    return {
      confere: rows.filter((c) => c.status === "CONFERE").length,
      naoConfere: rows.filter((c) => c.status === "NAO_CONFERE").length,
      erros: rows.filter((c) =>
        ["ERRO", "ABANDONADO", "EXPIRADO", "CAPTCHA_INVALIDO", "PORTAL_INDISPONIVEL"].includes(
          c.status,
        ),
      ).length,
      pendentes: rows.filter((c) => consultaPodeRetentar(c.status)).length,
    };
  }, [consultas]);

  const consultaAtual = useMemo(() => {
    if (!consultas?.length) return null;
    const porOrdem = consultas.find((c) => c.ordemNaLista === pessoaIndex);
    if (porOrdem && consultaPodeRetentar(porOrdem.status)) {
      return porOrdem;
    }
    return consultas.find((c) => consultaPodeRetentar(c.status)) ?? null;
  }, [consultas, pessoaIndex]);

  const loteEmAndamento = useMemo(
    () => consultas?.some((c) => c.status === "EM_ANDAMENTO") ?? false,
    [consultas],
  );

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
  const aguardandoResultado = consultaAtual?.status === "EM_ANDAMENTO";
  const primeiraConsulta =
    consultaAtual?.status === "PENDENTE" && !loteEmAndamento;
  const mostrarBotao =
    consultaAtual &&
    !pausado &&
    (consultaAtual.status === "PENDENTE" ||
      ["ABANDONADO", "EXPIRADO", "CAPTCHA_INVALIDO"].includes(
        consultaAtual.status,
      ));

  return (
    <div className="space-y-6">
      <AvisoExtensao />

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

      {!todasVerificadas && !pausado && consultaAtual && (
        <Card className="border-civilium-primary/30">
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="font-medium text-slate-900">
                {consultaAtual.nomeInformado}
              </p>
              <p className="text-sm text-slate-600">
                CPF {consultaAtual.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
              </p>
            </div>

            {primeiraConsulta && (
              <p className="text-sm text-slate-600">
                Uma única aba da Receita será usada para todo o lote. Após cada
                resultado, o formulário da próxima pessoa abrirá automaticamente na
                mesma aba.
              </p>
            )}

            {loteEmAndamento && aguardandoResultado && (
              <p className="text-sm text-civilium-primary-dark">
                Verificação em andamento na aba da Receita. Resolva o CAPTCHA e
                aguarde — ao concluir, a próxima pessoa carregará automaticamente.
              </p>
            )}

            {consultaAtual.status === "CAPTCHA_INVALIDO" && (
              <p className="text-sm text-amber-800">
                CAPTCHA inválido. O formulário será recarregado automaticamente na
                mesma aba para nova tentativa.
              </p>
            )}

            {["ABANDONADO", "EXPIRADO"].includes(consultaAtual.status) && (
              <p className="text-sm text-amber-800">
                A consulta anterior não foi concluída. Clique abaixo para retomar
                na mesma aba da Receita.
              </p>
            )}

            {mostrarBotao && (
              <BotaoAbrirPortal
                loteId={loteId}
                consultaId={consultaAtual.id}
                reabrir={!primeiraConsulta}
                modoLote
                onAberto={() => setPessoaIndex(consultaAtual.ordemNaLista)}
              />
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Fila de verificação
        </h2>
        <TabelaResultados consultas={consultas} />
      </div>
    </div>
  );
}
