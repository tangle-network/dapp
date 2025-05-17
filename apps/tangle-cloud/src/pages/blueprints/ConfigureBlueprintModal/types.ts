import { z } from 'zod';

export const blueprintFormSchema = z.object({
  rpcUrl: z.string().url({ message: 'Please enter a valid URL' }).optional(),
});

export type BlueprintFormSchema = z.infer<typeof blueprintFormSchema>;

export type BlueprintFormResult = {
  values: BlueprintFormSchema;
};
