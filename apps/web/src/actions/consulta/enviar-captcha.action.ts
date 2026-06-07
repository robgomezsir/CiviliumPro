"use server";

import { z } from "zod";
import { enviarCaptchaAutomacao } from "@/lib/automacao/sessao";
import { checkRateLimit } from "@/lib/rate-limit";
import { actionClient } from "@/lib/safe-action";

const schema = z.object({
  loteId: z.string().uuid(),
  consultaId: z.string().uuid(),
  captcha: z.string().min(1, "Digite o CAPTCHA"),
});

export const enviarCaptcha = actionClient.schema(schema).action(async ({ parsedInput }) => {
  if (!checkRateLimit(`captcha-${parsedInput.loteId}`, 30, 60_000)) {
    throw new Error("Muitas tentativas. Aguarde um momento.");
  }

  return enviarCaptchaAutomacao(parsedInput.loteId, {
    consultaId: parsedInput.consultaId,
    captcha: parsedInput.captcha,
  });
});
