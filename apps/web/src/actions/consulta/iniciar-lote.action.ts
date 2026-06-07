"use server";

import { iniciarLoteSchema } from "@civilium/shared";
import { db } from "@/db";
import { consultas, lotes } from "@/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { actionClient } from "@/lib/safe-action";

export const iniciarLote = actionClient
  .schema(iniciarLoteSchema)
  .action(async ({ parsedInput }) => {
    if (!checkRateLimit("iniciar-lote", 5, 60_000)) {
      throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
    }

    const loteId = await db.transaction(async (tx) => {
      const [lote] = await tx
        .insert(lotes)
        .values({
          nomeArquivo: parsedInput.nomeArquivo,
          totalPessoas: parsedInput.pessoas.length,
          status: "AGUARDANDO",
        })
        .returning({ id: lotes.id });

      await tx.insert(consultas).values(
        parsedInput.pessoas.map((pessoa, index) => ({
          loteId: lote.id,
          ordemNaLista: index + 1,
          nomeInformado: pessoa.nomeInformado,
          cpf: pessoa.cpf,
          dataNascimento: pessoa.dataNascimento,
          status: "PENDENTE" as const,
        })),
      );

      return lote.id;
    });

    return { loteId };
  });
