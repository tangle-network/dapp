import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { z } from 'zod';

export const blueprintFormSchema = z.object({
  rpcUrl: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .or(z.literal(''))
    .optional(),
});

export type BlueprintFormSchema = z.infer<typeof blueprintFormSchema>;

export type BlueprintFormResult = BlueprintFormSchema & {
  blueprints: Blueprint[];
};
