import { z } from 'zod';
import type { TransactionType } from '@webb-tools/abstract-api-provider';

export const txArraySchema = z
  .object({
    hash: z.string(),
    activity: z.enum(['deposit', 'transfer', 'withdraw']),
    amount: z.number(),
    fromAddress: z.string(),
    recipientAddress: z.string(),
    fungibleTokenSymbol: z.string(),
    wrapTokenSymbol: z.string().optional(),
    unwrapTokenSymbol: z.string().optional(),
    timestamp: z.number(),
    relayerName: z.string().optional(),
    relayerFeesAmount: z.number().optional(),
    relayerUri: z.string().optional(),
    refundAmount: z.number().optional(),
    refundRecipientAddress: z.string().optional(),
    refundTokenSymbol: z.string().optional(),
    inputNoteSerializations: z.array(z.string()).optional(),
    outputNoteSerializations: z.array(z.string()).optional(),
    explorerUri: z.string().optional(),
    sourceTypedChainId: z.number(),
    destinationTypedChainId: z.number(),
  })
  .array() satisfies z.ZodType<TransactionType[]>;
