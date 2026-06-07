import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { consultas } from "./consulta";
import { lotes } from "./lote";

export const sessoesAutomacao = pgTable("sessoes_automacao", {
  id: uuid("id").primaryKey().defaultRandom(),
  loteId: uuid("lote_id")
    .references(() => lotes.id)
    .notNull(),
  consultaId: uuid("consulta_id")
    .references(() => consultas.id)
    .notNull()
    .unique(),
  storageState: jsonb("storage_state").notNull(),
  cpf: text("cpf").notNull(),
  dataNascimento: text("data_nascimento").notNull(),
  nomeInformado: text("nome_informado"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
