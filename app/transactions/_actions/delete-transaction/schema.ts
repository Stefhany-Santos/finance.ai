import { z } from "zod";

export const deleteTransactionSchema = z.object({
  transactionId: z.string().uuid(),
});

export type DeleteTransactionSchema = z.infer<typeof deleteTransactionSchema>;
