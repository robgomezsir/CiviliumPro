import { rotuloErroReceita, type StatusConsulta } from "@civilium/shared";
import { Badge } from "@/components/ui/badge";

const labels: Record<StatusConsulta, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONFERE: "CONFERE",
  NAO_CONFERE: "NÃO CONFERE",
  ERRO: "ERRO",
  ABANDONADO: "Abandonado",
  EXPIRADO: "Expirado",
  CAPTCHA_INVALIDO: "CAPTCHA inválido",
  PORTAL_INDISPONIVEL: "Portal indisponível",
};

const variants: Record<
  StatusConsulta,
  "pendente" | "andamento" | "confere" | "naoConfere" | "erro" | "default"
> = {
  PENDENTE: "pendente",
  EM_ANDAMENTO: "andamento",
  CONFERE: "confere",
  NAO_CONFERE: "naoConfere",
  ERRO: "erro",
  ABANDONADO: "erro",
  EXPIRADO: "erro",
  CAPTCHA_INVALIDO: "erro",
  PORTAL_INDISPONIVEL: "erro",
};

type Props = {
  status: StatusConsulta;
  erroMensagem?: string | null;
};

export function ResultadoBadge({ status, erroMensagem }: Props) {
  const label =
    status === "ERRO" && erroMensagem
      ? rotuloErroReceita(status, erroMensagem)
      : labels[status];

  return (
    <Badge
      variant={variants[status]}
      title={erroMensagem ?? undefined}
      className={erroMensagem ? "cursor-help" : undefined}
    >
      {label}
    </Badge>
  );
}
