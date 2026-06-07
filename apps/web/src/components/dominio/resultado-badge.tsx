import { Badge } from "@/components/ui/badge";

type StatusConsulta =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONFERE"
  | "NAO_CONFERE"
  | "ERRO";

const labels: Record<StatusConsulta, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONFERE: "CONFERE",
  NAO_CONFERE: "NÃO CONFERE",
  ERRO: "ERRO",
};

const variants: Record<
  StatusConsulta,
  "pendente" | "andamento" | "confere" | "naoConfere" | "erro"
> = {
  PENDENTE: "pendente",
  EM_ANDAMENTO: "andamento",
  CONFERE: "confere",
  NAO_CONFERE: "naoConfere",
  ERRO: "erro",
};

export function ResultadoBadge({ status }: { status: StatusConsulta }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
