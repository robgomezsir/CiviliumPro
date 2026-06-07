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
  status: statusConsultaEnum("status").default("PENDENTE").notNull(),
  erroMensagem: text("erro_mensagem"),
  consultadaEm: timestamp("consultada_em"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
