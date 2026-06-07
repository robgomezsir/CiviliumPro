import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { lotes } from "./lote";

export const statusConsultaEnum = pgEnum("status_consulta", [
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONFERE",
  "NAO_CONFERE",
  "ERRO",
  "ABANDONADO",
  "EXPIRADO",
  "CAPTCHA_INVALIDO",
  "PORTAL_INDISPONIVEL",
]);

export const consultas = pgTable("consultas", {
  id: uuid("id").primaryKey().defaultRandom(),
  loteId: uuid("lote_id")
    .references(() => lotes.id)
    .notNull(),
  ordemNaLista: integer("ordem_na_lista").notNull(),
  nomeInformado: text("nome_informado").notNull(),
  cpf: text("cpf").notNull(),
  dataNascimento: text("data_nascimento").notNull(),
  nomeNaReceita: text("nome_na_receita"),
  situacaoCadastral: text("situacao_cadastral"),
  status: statusConsultaEnum("status").default("PENDENTE").notNull(),
  erroMensagem: text("erro_mensagem"),
  tokenConsulta: text("token_consulta"),
  resultadoRecebidoEm: timestamp("resultado_recebido_em"),
  abaAbertaEm: timestamp("aba_aberta_em"),
  consultadaEm: timestamp("consultada_em"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StatusConsulta = (typeof statusConsultaEnum.enumValues)[number];
