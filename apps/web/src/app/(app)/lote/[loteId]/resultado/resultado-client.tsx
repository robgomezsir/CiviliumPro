"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  IconDownload,
  IconTrash,
  IconArrowLeft,
} from "@tabler/icons-react";
import { concluirLote } from "@/actions/consulta/concluir-lote.action";
import { descartarLote } from "@/actions/consulta/descartar-lote.action";
import { GraficoResultados } from "@/components/dominio/grafico-resultados";
import { TabelaResultados } from "@/components/dominio/tabela-resultados";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsultas } from "@/hooks/queries/use-consultas";
import { useLote } from "@/hooks/queries/use-lote";
import { useUrlListState, useUrlNumberState } from "@/hooks/use-url-state";
import { gerarCsvResultados } from "@/lib/export-csv";

const FILTROS = ["CONFERE", "NAO_CONFERE", "ERRO"] as const;

type Props = {
  loteId: string;
};

export function ResultadoClient({ loteId }: Props) {
  const router = useRouter();
  const { data: lote } = useLote(loteId);
  const { data: consultas } = useConsultas(loteId);
  const [filtroStatus, setFiltroStatus] = useUrlListState("resultado");
  const [pagina, setPagina] = useUrlNumberState("pagina", 1);
  const [dialogDescartar, setDialogDescartar] = useState(false);
  const [isSalvando, setIsSalvando] = useState(false);

  const stats = useMemo(() => {
    const rows = consultas ?? [];
    return {
      confere: rows.filter((c) => c.status === "CONFERE").length,
      naoConfere: rows.filter((c) => c.status === "NAO_CONFERE").length,
      erros: rows.filter((c) =>
        [
          "ERRO",
          "ABANDONADO",
          "EXPIRADO",
          "CAPTCHA_INVALIDO",
          "PORTAL_INDISPONIVEL",
        ].includes(c.status),
      ).length,
    };
  }, [consultas]);

  const toggleFiltro = (status: string) => {
    if (filtroStatus.includes(status)) {
      setFiltroStatus(filtroStatus.filter((s) => s !== status));
    } else {
      setFiltroStatus([...filtroStatus, status]);
    }
    setPagina(1);
  };

  const exportarCsv = () => {
    if (!consultas) return;
    const csv = gerarCsvResultados(
      consultas.map((c) => ({
        nomeInformado: c.nomeInformado,
        cpf: c.cpf,
        nomeNaReceita: c.nomeNaReceita,
        status: c.status,
        erroMensagem: c.erroMensagem,
        consultadaEm: c.consultadaEm,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `civilium-${lote?.nomeArquivo ?? loteId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Planilha exportada");
  };

  const handleConcluir = async () => {
    setIsSalvando(true);
    try {
      const result = await concluirLote({ loteId });
      if (result?.serverError) throw new Error(result.serverError);
      exportarCsv();
      toast.success("Lote concluído com sucesso");
      router.push("/painel");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao concluir lote",
      );
    } finally {
      setIsSalvando(false);
    }
  };

  const handleDescartar = async () => {
    setIsSalvando(true);
    try {
      const result = await descartarLote({ loteId });
      if (result?.serverError) throw new Error(result.serverError);
      toast.success("Lote descartado");
      router.push("/painel");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao descartar lote",
      );
    } finally {
      setIsSalvando(false);
      setDialogDescartar(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2">
            <Link href={`/lote/${loteId}`}>
              <IconArrowLeft className="h-4 w-4" />
              Voltar ao lote
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            Resultado — {lote?.nomeArquivo}
          </h1>
          <p className="text-slate-600">
            Revise os resultados e exporte ou descarte o lote
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">CONFERE</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.confere}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">NÃO CONFERE</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.naoConfere}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-700">ERRO</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.erros}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição dos resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoResultados
            confere={stats.confere}
            naoConfere={stats.naoConfere}
            erros={stats.erros}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pessoas verificadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((status) => (
              <Button
                key={status}
                variant={filtroStatus.includes(status) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFiltro(status)}
              >
                {status === "NAO_CONFERE" ? "NÃO CONFERE" : status}
              </Button>
            ))}
          </div>
          {consultas && (
            <TabelaResultados
              consultas={consultas}
              filtroStatus={filtroStatus}
              pagina={pagina}
            />
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setPagina(Math.max(1, pagina - 1))}
              disabled={pagina <= 1}
            >
              Página anterior
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setPagina(pagina + 1)}
            >
              Próxima página
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-slate-50 py-4 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          disabled={isSalvando}
          onClick={handleConcluir}
        >
          <IconDownload className="h-5 w-5" />
          Exportar resultado
        </Button>
        <Button
          size="lg"
          variant="destructive"
          className="flex-1"
          disabled={isSalvando}
          onClick={() => setDialogDescartar(true)}
        >
          <IconTrash className="h-5 w-5" />
          Descartar lote
        </Button>
      </div>

      <Dialog open={dialogDescartar} onOpenChange={setDialogDescartar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar lote?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O lote será removido da sua lista,
              mas permanecerá no histórico de auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDialogDescartar(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isSalvando}
              onClick={handleDescartar}
            >
              Descartar lote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
