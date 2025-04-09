import { PrimitiveAssetMetadata } from '@tangle-network/tangle-shared-ui/types/restake';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import {
  isEvmAddress,
  isSubstrateAddress,
} from '@tangle-network/ui-components';
import { z } from 'zod';

export const assetSchema = z.object({
  id: z.string().transform((value, ctx) => {
    try {
      assertRestakeAssetId(value);
    } catch (error: unknown) {
      console.error(`Asset id ${value} is invalid: ${error}`);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid RestakeAssetId',
      });

      return z.NEVER;
    }

    return value;
  }),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
  deposit: z.string().optional(),
  isFrozen: z.boolean().optional(),
  priceInUsd: z.number().nullable(),
});

export type AssetSchema = z.infer<typeof assetSchema>;

export const deployBlueprintSchema = z
  .object({
    instanceName: z.string().min(1),
    instanceDuration: z.number().min(1),
    permittedCallers: z.array(z.string()).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one caller is required',
        });

        return z.NEVER;
      }

      for (const [index, caller] of value.entries()) {
        if (!isEvmAddress(caller) && !isSubstrateAddress(caller)) {
          context.addIssue({
            path: [index],
            code: z.ZodIssueCode.custom,
            message: 'Invalid caller address',
          });
        }
      }

      // validate not duplicate caller
      const uniqueCallers = new Set(value);
      if (uniqueCallers.size !== value.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Caller addresses must be unique',
        });

        return z.NEVER;
      }

      return value;
    }),
    operators: z.array(z.string()).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one operator is required',
        });

        return z.NEVER;
      }

      return value;
    }),
    assets: z.array(assetSchema).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one asset is required',
        });

        return z.NEVER;
      }

      return value;
    }),
    securityCommitments: z
      .array(
        z.object({
          minExposurePercent: z.number().min(1).max(100).default(0),
          maxExposurePercent: z.number().min(1).max(100).default(100),
        }),
      )
      .transform((value, context) => {
        if (value.length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one security commitment is required',
          });

          return z.NEVER;
        }

        for (const [index, commitment] of value.entries()) {
          if (commitment.minExposurePercent > commitment.maxExposurePercent) {
            context.addIssue({
              path: [index],
              code: z.ZodIssueCode.custom,
              message:
                'Min exposure percent cannot be greater than max exposure percent',
            });

            return z.NEVER;
          }
        }

        return value;
      }),
    approvalModel: z.enum(['Dynamic', 'Fixed']),
    minApproval: z.number().min(1),
    maxApproval: z.number().min(1).optional(),
    /**
     * @dev request args are too complex to validate, so we're just going to pass it through
     * and use {toPrimitiveArgsDataType}@link{../index.ts} to convert it to the correct type
     */
    requestArgs: z.array(z.any()).min(0),
    paymentAsset: assetSchema.transform((value, context) => {
      try {
        assertRestakeAssetId(value.id);
      } catch (error: unknown) {
        console.error(`Asset id ${value.id} is invalid: ${error}`);
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid payment asset',
        });

        return z.NEVER;
      }

      return value;
    }),
    paymentAmount: z.number(),
  })
  .superRefine((schema, ctx) => {
    if (schema.approvalModel === 'Dynamic') {
      // If approval model is dynamic, `maxApproval` is required
      if (!schema.maxApproval) {
        ctx.addIssue({
          path: [`maxApproval`],
          code: z.ZodIssueCode.custom,
          message: 'Max approval is required for dynamic approval model',
        });

        return z.NEVER;
      }

      // `approvalThreshold` must be less than or equal to the number of operators
      if (schema.minApproval > schema.operators.length) {
        ctx.addIssue({
          path: [`minApproval`],
          code: z.ZodIssueCode.custom,
          message: 'Min approval cannot be greater than number of operators',
        });

        return z.NEVER;
      }

      return schema;
    }
  });

export type DeployBlueprintSchema = z.infer<typeof deployBlueprintSchema>;

export const mapPrimitiveAssetMetadataToAssetSchema = (asset: PrimitiveAssetMetadata): AssetSchema => {
  return {
    id: asset.id ?? '0',
    name: asset.name ?? 'TNT',
    symbol: asset.symbol ?? 'TNT',
    decimals: asset.decimals ?? 0,
    deposit: asset.deposit ?? '0',
    isFrozen: asset.isFrozen ?? false,
    priceInUsd: asset.priceInUsd ?? null,
  };
};