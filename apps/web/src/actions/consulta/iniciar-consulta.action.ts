"use server";

import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { prepararConsulta } from "@/lib/preparar-consulta";
import { actionClient } from "@/lib/safe-action";

const schema = z.object({
  loteId: z.string().uuid(),
  consultaId: z.string().uuid(),
});

export const iniciarConsulta = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    if (!checkRateLimit(`consulta-${parsedInput.loteId}`, 30, 60_000)) {
      throw new Error("Muitas consultas em sequência. Aguarde um momento.");
    }

    return prepararConsulta(parsedInput.consultaId, parsedInput.loteId);
  });
