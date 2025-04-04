import { z } from 'zod';

export enum PricingType {
  GLOBAL = 'global',
  INDIVIDUAL = 'individual',
}

const getPriceSchema = (priceType: string) =>
  z
    .string()
    .or(z.number().int().positive())
    .transform((value, context) => {
      if (value === '') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${priceType} price is required`,
        });

        return z.NEVER;
      }

      const parsed = Number(value);

      if (isNaN(parsed) || !Number.isInteger(parsed)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${priceType} price is invalid`,
        });

        return z.NEVER;
      }

      if (parsed < 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${priceType} price must be greater than 0`,
        });

        return z.NEVER;
      }

      return value;
    });

const priceSchema = z.object({
  cpuPrice: getPriceSchema('CPU'),
  memPrice: getPriceSchema('Memory'),
  hddStoragePrice: getPriceSchema('HDD Storage'),
  ssdStoragePrice: getPriceSchema('SSD Storage'),
  nvmeStoragePrice: getPriceSchema('NVMe Storage'),
});

export const globalFormSchema = priceSchema;

export const individualFormSchema = z.record(z.string(), priceSchema);

export type PriceFieldSchema = z.infer<typeof priceSchema>;

export type GlobalFormSchema = z.infer<typeof globalFormSchema>;

export type IndividualFormSchema = z.infer<typeof individualFormSchema>;

export type PricingFormResult =
  | {
      type: PricingType.GLOBAL;
      values: GlobalFormSchema;
    }
  | {
      type: PricingType.INDIVIDUAL;
      values: IndividualFormSchema;
    };
