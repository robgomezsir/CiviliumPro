import { Badge } from "@/components/ui/badge";

const config: Record<
  string,
  { label: string; variant: "default" | "pendente" | "andamento" | "confere" | "erro" }
> = {
  AGUARDANDO: { label: "Aguardando", variant: "pendente" },
  EM_CONSULTA: { label: "Em consulta", variant: "andamento" },
  CONCLUIDO: { label: "Concluído", variant: "confere" },
  DESCARTADO: { label: "Descartado", variant: "erro" },
};

export function StatusLoteBadge({ status }: { status: string }) {
  const item = config[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
