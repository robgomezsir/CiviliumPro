"use client";

import type { STATUS_LOTE_FILTRO } from "@civilium/shared";
import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  IconArrowRight,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { StatusLoteBadge } from "@/components/dominio/status-lote-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAtualizarLote,
  useExcluirLote,
} from "@/hooks/mutations/use-lote-mutations";
import { useLotes } from "@/hooks/queries/use-lotes";
type Lote = {
  id: string;
  nomeArquivo: string;
  status: string;
  totalPessoas: number;
  consultadasCount: number;
  pausado: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const FILTROS_STATUS: Array<{
  value: (typeof STATUS_LOTE_FILTRO)[number];
  label: string;
}> = [
  { value: "TODOS", label: "Todos" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "EM_CONSULTA", label: "Em consulta" },
  { value: "CONCLUIDO", label: "Concluídos" },
  { value: "DESCARTADO", label: "Descartados" },
];

export function PainelLotesCrud() {
  const [statusFiltro, setStatusFiltro] =
    useState<(typeof STATUS_LOTE_FILTRO)[number]>("TODOS");
  const [incluirDescartados, setIncluirDescartados] = useState(false);

  const [loteEdicao, setLoteEdicao] = useState<Lote | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [loteExclusao, setLoteExclusao] = useState<Lote | null>(null);
  const [loteDetalhe, setLoteDetalhe] = useState<Lote | null>(null);

  const filtros = useMemo(
    () => ({
      status: statusFiltro,
      incluirDescartados,
    }),
    [statusFiltro, incluirDescartados],
  );

  const { data: lotes, isLoading, refetch, isFetching } = useLotes(filtros);
  const atualizar = useAtualizarLote();
  const excluir = useExcluirLote();

  const abrirEdicao = (lote: Lote) => {
    setLoteEdicao(lote);
    setNomeEdicao(lote.nomeArquivo);
  };

  const salvarEdicao = async () => {
    if (!loteEdicao) return;
    try {
      await atualizar.mutateAsync({
        loteId: loteEdicao.id,
        nomeArquivo: nomeEdicao,
      });
      toast.success("Lote atualizado");
      setLoteEdicao(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar lote",
      );
    }
  };

  const confirmarExclusao = async () => {
    if (!loteExclusao) return;
    try {
      await excluir.mutateAsync(loteExclusao.id);
      toast.success("Lote removido permanentemente");
      setLoteExclusao(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir lote",
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Manutenção de lotes</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <IconRefresh className="h-4 w-4" />
                Atualizar
              </Button>
              <Button size="sm" asChild>
                <Link href="/lote">
                  <IconPlus className="h-4 w-4" />
                  Novo lote
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTROS_STATUS.map((item) => (
              <Button
                key={item.value}
                variant={statusFiltro === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFiltro(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={incluirDescartados}
              onChange={(e) => setIncluirDescartados(e.target.checked)}
              className="rounded border-slate-300"
            />
            Incluir lotes descartados na listagem geral
          </label>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-slate-500">Carregando lotes...</p>
          ) : !lotes?.length ? (
            <div className="py-8 text-center">
              <p className="text-slate-600">Nenhum lote encontrado</p>
              <Button className="mt-4" asChild>
                <Link href="/lote">
                  <IconPlus className="h-4 w-4" />
                  Criar primeiro lote
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Progresso</th>
                    <th className="px-4 py-3 font-medium">Criado em</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote) => (
                    <tr key={lote.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {lote.nomeArquivo}
                      </td>
                      <td className="px-4 py-3">
                        <StatusLoteBadge status={lote.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {lote.consultadasCount}/{lote.totalPessoas}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {dayjs(lote.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Detalhes"
                            onClick={() => setLoteDetalhe(lote)}
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>

                          {lote.status !== "DESCARTADO" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar nome"
                                onClick={() => abrirEdicao(lote)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>

                              {lote.status === "CONCLUIDO" ? (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/lote/${lote.id}/resultado`}>
                                    Resultado
                                    <IconArrowRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/lote/${lote.id}?pessoa=1`}>
                                    Abrir
                                    <IconArrowRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            title="Excluir permanentemente"
                            className="text-red-700 hover:text-red-800"
                            onClick={() => setLoteExclusao(lote)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(loteEdicao)} onOpenChange={() => setLoteEdicao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar lote</DialogTitle>
            <DialogDescription>
              Altere o nome de identificação do lote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-lote">Nome do arquivo</Label>
              <Input
                id="nome-lote"
                value={nomeEdicao}
                onChange={(e) => setNomeEdicao(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setLoteEdicao(null)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={atualizar.isPending || !nomeEdicao.trim()}
                onClick={salvarEdicao}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(loteExclusao)}
        onOpenChange={() => setLoteExclusao(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lote?</DialogTitle>
            <DialogDescription>
              O lote &quot;{loteExclusao?.nomeArquivo}&quot; e todas as suas
              consultas serão removidos permanentemente do banco de dados. Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLoteExclusao(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={excluir.isPending}
              onClick={confirmarExclusao}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(loteDetalhe)} onOpenChange={() => setLoteDetalhe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{loteDetalhe?.nomeArquivo}</DialogTitle>
            <DialogDescription>Detalhes do lote pesquisado</DialogDescription>
          </DialogHeader>
          {loteDetalhe && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Status</span>
                <StatusLoteBadge status={loteDetalhe.status} />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Progresso</span>
                <span>
                  {loteDetalhe.consultadasCount}/{loteDetalhe.totalPessoas}{" "}
                  verificadas
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Pausado</span>
                <span>{loteDetalhe.pausado ? "Sim" : "Não"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Criado em</span>
                <span>
                  {dayjs(loteDetalhe.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Atualizado em</span>
                <span>
                  {dayjs(loteDetalhe.updatedAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                {loteDetalhe.status === "CONCLUIDO" ? (
                  <Button className="flex-1" asChild>
                    <Link href={`/lote/${loteDetalhe.id}/resultado`}>
                      Ver resultado
                    </Link>
                  </Button>
                ) : loteDetalhe.status !== "DESCARTADO" ? (
                  <Button className="flex-1" asChild>
                    <Link href={`/lote/${loteDetalhe.id}?pessoa=1`}>
                      Continuar lote
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
