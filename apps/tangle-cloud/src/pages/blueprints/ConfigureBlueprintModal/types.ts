import { z } from 'zod';

// New blueprint form schema for RPC URL
const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export const blueprintFormSchema = z.object({
  rpcUrl: z.string().refine((value) => value === '' || urlPattern.test(value), {
    message: 'Please enter a valid URL',
  }),
});

export type BlueprintFormSchema = z.infer<typeof blueprintFormSchema>;

export type BlueprintFormResult = {
  values: BlueprintFormSchema;
};
