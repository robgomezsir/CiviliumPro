import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const auditoriaEventos = pgTable("auditoria_eventos", {
  id: uuid("id").primaryKey().defaultRandom(),
  entidade: text("entidade").notNull(),
  entidadeId: uuid("entidade_id").notNull(),
  acao: text("acao").notNull(),
  snapshotAntes: jsonb("snapshot_antes"),
  snapshotDepois: jsonb("snapshot_depois"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
