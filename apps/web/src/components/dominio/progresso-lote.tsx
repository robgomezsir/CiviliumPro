"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  total: number;
  consultadas: number;
  confere: number;
  naoConfere: number;
  erros: number;
  pendentes: number;
};

export function ProgressoLote({
  total,
  consultadas,
  confere,
  naoConfere,
  erros,
  pendentes,
}: Props) {
  const percentual = total > 0 ? Math.round((consultadas / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso do lote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-700">
            <span>
              {consultadas} de {total} verificadas
            </span>
            <span>{percentual}%</span>
          </div>
          <Progress value={percentual} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="CONFERE" value={confere} className="text-green-700" />
          <Stat label="NÃO CONFERE" value={naoConfere} className="text-red-700" />
          <Stat label="ERRO" value={erros} className="text-amber-700" />
          <Stat label="Pendentes" value={pendentes} className="text-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-600">{label}</p>
      <p className={`text-2xl font-bold ${className ?? ""}`}>{value}</p>
    </div>
  );
}
