import { z } from 'zod';

export enum PricingType {
  GLOBAL = 'global',
  INDIVIDUAL = 'individual',
}

const getPriceSchema = (priceType: string) =>
  z
    .string()
    .nonempty(`${priceType} price is required`)
    .or(z.number().min(0, `${priceType} price must be greater than 0`));

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
