import { z } from "zod";
import { limparCpf } from "./format-cpf";

export const MAX_PESSOAS_POR_LOTE = 100;

export const pessoaPlanilhaSchema = z.object({
  nomeInformado: z.string().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .transform(limparCpf)
    .pipe(z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos")),
  dataNascimento: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA"),
});

export const iniciarLoteSchema = z.object({
  nomeArquivo: z.string().min(1, "Nome do arquivo é obrigatório"),
  pessoas: z
    .array(pessoaPlanilhaSchema)
    .min(1, "A planilha precisa ter pelo menos uma pessoa")
    .max(MAX_PESSOAS_POR_LOTE, `Máximo de ${MAX_PESSOAS_POR_LOTE} pessoas por lote`),
});

export const pausarLoteSchema = z.object({
  loteId: z.string().uuid(),
  pausado: z.boolean(),
});

export const descartarLoteSchema = z.object({
  loteId: z.string().uuid(),
});

export const excluirLoteSchema = z.object({
  loteId: z.string().uuid(),
});

export const atualizarLoteSchema = z.object({
  loteId: z.string().uuid(),
  nomeArquivo: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome muito longo"),
});

export const restaurarLoteSchema = z.object({
  loteId: z.string().uuid(),
});

export const STATUS_LOTE_FILTRO = [
  "TODOS",
  "AGUARDANDO",
  "EM_CONSULTA",
  "CONCLUIDO",
  "DESCARTADO",
] as const;

export const listarLotesSchema = z.object({
  busca: z.string().optional(),
  status: z.enum(STATUS_LOTE_FILTRO).default("TODOS"),
  incluirDescartados: z.boolean().default(false),
});

export const concluirLoteSchema = z.object({
  loteId: z.string().uuid(),
});

export type PessoaPlanilha = z.infer<typeof pessoaPlanilhaSchema>;
export type IniciarLoteInput = z.infer<typeof iniciarLoteSchema>;

export const COLUNAS_PLANILHA = ["nome", "cpf", "data_nascimento"] as const;
