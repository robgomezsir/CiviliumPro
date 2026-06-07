"use client";

import Link from "next/link";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { AvisoExtensao } from "@/components/dominio/aviso-extensao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLotes } from "@/hooks/queries/use-lotes";
import dayjs from "dayjs";

const statusLoteLabel: Record<string, string> = {
  AGUARDANDO: "Aguardando",
  EM_CONSULTA: "Em consulta",
  CONCLUIDO: "Concluído",
  DESCARTADO: "Descartado",
};

export default function PainelPage() {
  const { data: lotes, isLoading } = useLotes();

  return (
    <div className="space-y-6">
      <AvisoExtensao />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
          <p className="text-slate-600">
            Acompanhe seus lotes de verificação cadastral
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/lote">
            <IconPlus className="h-5 w-5" />
            Nova planilha
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lotes recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500">Carregando lotes...</p>
          ) : !lotes?.length ? (
            <div className="py-8 text-center">
              <p className="text-slate-600">Nenhum lote ainda</p>
              <Button className="mt-4" asChild>
                <Link href="/lote">
                  <IconPlus className="h-4 w-4" />
                  Enviar primeira planilha
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lotes.map((lote) => (
                <div
                  key={lote.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{lote.nomeArquivo}</p>
                    <p className="text-sm text-slate-600">
                      {lote.consultadasCount}/{lote.totalPessoas} verificadas ·{" "}
                      {dayjs(lote.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {statusLoteLabel[lote.status] ?? lote.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {lote.status === "CONCLUIDO" ? (
                      <Button variant="outline" asChild>
                        <Link href={`/lote/${lote.id}/resultado`}>
                          Ver resultado
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : lote.status !== "DESCARTADO" ? (
                      <Button asChild>
                        <Link href={`/lote/${lote.id}?pessoa=1`}>
                          Continuar
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-sm text-slate-500">Descartado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
