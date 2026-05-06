import { z } from 'zod';
import { Address } from 'viem';

const isEvmAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

// Duration unit constants
export const DURATION_UNITS = {
  seconds: { label: 'Seconds', seconds: 1 },
  minutes: { label: 'Minutes', seconds: 60 },
  hours: { label: 'Hours', seconds: 3600 },
  days: { label: 'Days', seconds: 86400 },
} as const;

export type DurationUnit = keyof typeof DURATION_UNITS;
export type RequestMode = 'basic' | 'exposure' | 'security';
export type PaymentMethod = 'shieldedCredits' | 'publicWallet';

// Validation constraints in seconds
const MIN_DURATION_SECONDS = 3600; // 1 hour
const MAX_DURATION_SECONDS = 31536000; // 365 days

// Convert duration value and unit to seconds
export const toSeconds = (value: number, unit: DurationUnit): number => {
  return value * DURATION_UNITS[unit].seconds;
};

// Convert seconds to a user-friendly duration (returns value and best-fit unit)
export const fromSeconds = (
  seconds: number,
): { value: number; unit: DurationUnit } => {
  if (seconds === 0) {
    return { value: 0, unit: 'seconds' };
  }

  // Try to find the best unit (prefer whole numbers, largest unit first)
  if (seconds % DURATION_UNITS.days.seconds === 0) {
    return { value: seconds / DURATION_UNITS.days.seconds, unit: 'days' };
  }
  if (seconds % DURATION_UNITS.hours.seconds === 0) {
    return { value: seconds / DURATION_UNITS.hours.seconds, unit: 'hours' };
  }
  if (seconds % DURATION_UNITS.minutes.seconds === 0) {
    return { value: seconds / DURATION_UNITS.minutes.seconds, unit: 'minutes' };
  }
  return { value: seconds, unit: 'seconds' };
};

// Get min/max values for a given unit
export const getDurationConstraints = (
  unit: DurationUnit,
): { min: number; max: number } => {
  const unitSeconds = DURATION_UNITS[unit].seconds;
  return {
    min: Math.ceil(MIN_DURATION_SECONDS / unitSeconds),
    max: Math.floor(MAX_DURATION_SECONDS / unitSeconds),
  };
};

export const assetSchema = z.object({
  id: z.string().transform((value, ctx) => {
    if (!isEvmAddress(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid asset address',
      });
      return z.NEVER;
    }
    return value as Address;
  }),
  metadata: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    priceInUsd: z.number().nullable().optional(),
  }),
});

export type AssetSchema = z.infer<typeof assetSchema>;

export const deployBlueprintSchema = z
  .object({
    instanceName: z.string().min(1),
    // Duration value in the selected unit
    instanceDuration: z.number().min(0),
    // Duration unit (defaults to seconds)
    durationUnit: z
      .enum(['seconds', 'minutes', 'hours', 'days'])
      .default('seconds'),
    requestMode: z.enum(['basic', 'exposure', 'security']).default('basic'),
    paymentMethod: z
      .enum(['shieldedCredits', 'publicWallet'])
      .default('shieldedCredits'),
    creditCommitment: z.string().optional(),
    operatorExposurePercents: z
      .record(z.string(), z.number().int().min(1).max(100))
      .default({})
      .transform((value) => {
        return Object.fromEntries(
          Object.entries(value).map(([operator, percent]) => [
            operator.toLowerCase(),
            percent,
          ]),
        );
      }),
    permittedCallers: z.array(z.string()).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one caller is required',
        });
        return z.NEVER;
      }

      for (const [index, caller] of value.entries()) {
        if (!isEvmAddress(caller)) {
          context.addIssue({
            path: [index],
            code: z.ZodIssueCode.custom,
            message: 'Invalid caller address',
          });
        }
      }

      const uniqueCallers = new Set(value);
      if (uniqueCallers.size !== value.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Caller addresses must be unique',
        });
        return z.NEVER;
      }

      return value as Address[];
    }),
    operators: z.array(z.string()).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one operator is required',
        });
        return z.NEVER;
      }

      for (const [index, operator] of value.entries()) {
        if (!isEvmAddress(operator)) {
          context.addIssue({
            path: [index],
            code: z.ZodIssueCode.custom,
            message: 'Invalid operator address',
          });
        }
      }

      return value as Address[];
    }),
    assets: z.array(assetSchema).default([]),
    securityCommitments: z
      .array(
        z.object({
          minExposurePercent: z.number().min(1).max(100).default(1),
          maxExposurePercent: z.number().min(1).max(100).default(100),
        }),
      )
      .default([]),
    requestArgs: z.array(z.any()).default([]),
    paymentAsset: assetSchema.optional(),
    paymentAmount: z.string().regex(/^\d*\.?\d*$/, 'Must be a valid number'),
  })
  .superRefine((schema, ctx) => {
    if (
      schema.paymentMethod === 'shieldedCredits' &&
      !schema.creditCommitment
    ) {
      ctx.addIssue({
        path: ['creditCommitment'],
        code: z.ZodIssueCode.custom,
        message: 'Select or create a credit account',
      });
    }

    if (schema.paymentMethod === 'publicWallet' && !schema.paymentAsset) {
      ctx.addIssue({
        path: ['paymentAsset'],
        code: z.ZodIssueCode.custom,
        message: 'Select a payment asset',
      });
    }

    // Validate duration: 0 for perpetual, or between 1 hour and 365 days
    if (schema.instanceDuration !== 0) {
      const durationInSeconds = toSeconds(
        schema.instanceDuration,
        schema.durationUnit,
      );

      if (
        durationInSeconds < MIN_DURATION_SECONDS ||
        durationInSeconds > MAX_DURATION_SECONDS
      ) {
        const constraints = getDurationConstraints(schema.durationUnit);
        ctx.addIssue({
          path: ['instanceDuration'],
          code: z.ZodIssueCode.custom,
          message: `Duration must be 0 (perpetual) or between ${constraints.min} and ${constraints.max} ${schema.durationUnit}`,
        });
      }
    }

    if (schema.requestMode === 'exposure') {
      schema.operators.forEach((operator, index) => {
        const key = operator.toLowerCase();
        const exposurePercent = schema.operatorExposurePercents[key];

        if (exposurePercent === undefined) {
          ctx.addIssue({
            path: ['operatorExposurePercents', key],
            code: z.ZodIssueCode.custom,
            message: `Exposure percent is required for operator #${index + 1}`,
          });
        }
      });
    }

    if (schema.requestMode === 'security') {
      if (schema.assets.length === 0) {
        ctx.addIssue({
          path: ['assets'],
          code: z.ZodIssueCode.custom,
          message: 'At least one asset is required for security mode',
        });
      }

      if (schema.securityCommitments.length === 0) {
        ctx.addIssue({
          path: ['securityCommitments'],
          code: z.ZodIssueCode.custom,
          message:
            'At least one security commitment is required for security mode',
        });
      }

      if (schema.assets.length !== schema.securityCommitments.length) {
        ctx.addIssue({
          path: ['assets'],
          code: z.ZodIssueCode.custom,
          message: 'Assets and security commitments must have the same length',
        });
      }

      for (const [index, commitment] of schema.securityCommitments.entries()) {
        if (commitment.minExposurePercent > commitment.maxExposurePercent) {
          ctx.addIssue({
            path: ['securityCommitments', index, 'minExposurePercent'],
            code: z.ZodIssueCode.custom,
            message:
              'Min exposure percent cannot be greater than max exposure percent',
          });
        }
      }
    }
  });

export type DeployBlueprintSchema = z.infer<typeof deployBlueprintSchema>;
