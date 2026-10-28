import { z } from "zod";
import { mediaKeySchema } from "./media.js";

export const resizeImageJobSchema = z
  .object({
    mediaId: z.string().min(1),
    sourceKey: mediaKeySchema,
    formats: z.array(z.enum(["webp", "avif", "jpeg", "png"])).min(1),
    widths: z.array(z.number().int().positive()).min(1),
  })
  .strict();

export type ResizeImageJob = z.infer<typeof resizeImageJobSchema>;
