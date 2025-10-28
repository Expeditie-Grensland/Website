import { z } from "zod";

export const fileImageSchema = z.object({
  name: z.string().regex(/^([a-z0-9]+-)*[a-z0-9]+$/),
  file: z.instanceof(Buffer),
});
