import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const statusLoteEnum = pgEnum("status_lote", [
  "AGUARDANDO",
  "EM_CONSULTA",
  "CONCLUIDO",
  "DESCARTADO",
]);

export const lotes = pgTable("lotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomeArquivo: text("nome_arquivo").notNull(),
  status: statusLoteEnum("status").default("AGUARDANDO").notNull(),
  totalPessoas: integer("total_pessoas").notNull(),
  consultadasCount: integer("consultadas_count").default(0).notNull(),
  pausado: integer("pausado").default(0).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
