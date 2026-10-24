import { pgTable, uuid, text, integer, index } from "drizzle-orm/pg-core";
import { batches } from "../core/batches";
import { profiles } from "../core/profiles";
import { timestamps } from "../common";

/** Files teachers share with a batch (stored in the private Supabase Storage bucket "study-materials"). */
export const studyMaterials = pgTable(
  "study_materials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Null means shared with every batch. */
    batchId: uuid("batch_id").references(() => batches.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    storagePath: text("storage_path").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    uploadedBy: uuid("uploaded_by").references(() => profiles.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("study_materials_batch_idx").on(t.batchId)]
);
