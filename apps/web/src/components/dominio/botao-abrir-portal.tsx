"use client";

import { useState } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { iniciarConsulta } from "@/actions/consulta/iniciar-consulta.action";
import { Button } from "@/components/ui/button";
import { mensagemErroAcao } from "@/lib/erro-acao";
import {
  pingExtensao,
  registrarConsultaExtensao,
} from "@/lib/extensao-bridge";

type Props = {
  loteId: string;
  consultaId: string;
  disabled?: boolean;
  reabrir?: boolean;
  modoLote?: boolean;
  onAberto?: () => void;
};

export function BotaoAbrirPortal({
  loteId,
  consultaId,
  disabled,
  reabrir = false,
  modoLote = true,
  onAberto,
}: Props) {
  const [abrindo, setAbrindo] = useState(false);

  async function abrir() {
    setAbrindo(true);

    try {
      const online = await pingExtensao();
      if (!online) {
        toast.error(
          "Extensão Civilium Bridge não encontrada. Instale a extensão no Chrome.",
        );
        return;
      }

      const result = await iniciarConsulta({ loteId, consultaId });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      const payload = result?.data;
      if (!payload) {
        throw new Error("Não foi possível preparar a consulta");
      }

      const registrado = await registrarConsultaExtensao({
        ...payload,
        modoLote,
      });

      if (!registrado) {
        toast.error("Erro ao registrar consulta na extensão.");
        return;
      }

      toast.success(
        modoLote
          ? "Verificação em lote iniciada. Use a mesma aba da Receita para todas as pessoas."
          : "Portal da Receita aberto. Resolva o CAPTCHA na nova aba.",
      );
      onAberto?.();
    } catch (error) {
      toast.error(mensagemErroAcao(error));
    } finally {
      setAbrindo(false);
    }
  }

  const label = abrindo
    ? "Abrindo portal..."
    : reabrir
      ? "Retomar na mesma aba"
      : modoLote
        ? "Iniciar verificação em lote"
        : "Abrir portal da Receita";

  return (
    <Button size="lg" className="w-full" onClick={abrir} disabled={disabled || abrindo}>
      <IconExternalLink className="h-5 w-5" />
      {label}
    </Button>
  );
}
