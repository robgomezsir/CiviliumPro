"use server";

import { desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { lotes } from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

export const listarLotes = actionClient.action(async () => {
  return db
    .select()
    .from(lotes)
    .where(isNull(lotes.deletedAt))
    .orderBy(desc(lotes.createdAt))
    .limit(20);
});
