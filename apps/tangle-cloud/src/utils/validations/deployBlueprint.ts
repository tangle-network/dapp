import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import {
  isEvmAddress,
  isSubstrateAddress,
} from '@tangle-network/ui-components';
import { z } from 'zod';

export const BLUEPRINT_DEPLOY_STEPS = [
  'step1',
  'step2',
  'step3',
  'step4',
] as const;

export const restakeAssetSchema = z.object({
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
  metadata: z.object({
    assetId: z.string(),
    vaultId: z.number().nullable().optional(),
    priceInUsd: z.number().nullable().optional(),
    details: z.any().optional(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    deposit: z.string().optional(),
    isFrozen: z.boolean().optional(),
  }),
});

export const deployBlueprintSchema = z.object({
  [BLUEPRINT_DEPLOY_STEPS[0]]: z.object({
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

      return value;
    }),
  }),
  [BLUEPRINT_DEPLOY_STEPS[1]]: z.object({
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
    assets: z.array(restakeAssetSchema).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one asset is required',
        });

        return z.NEVER;
      }

      return value;
    }),
  }),
  [BLUEPRINT_DEPLOY_STEPS[2]]: z.object({
    securityCommitments: z
      .array(
        z.object({
          minExposurePercent: z.number().min(1).max(100),
          maxExposurePercent: z.number().min(1).max(100),
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
    minApproval: z.number().min(1).optional(),
    maxApproval: z.number().min(1).optional(),
  }),
  [BLUEPRINT_DEPLOY_STEPS[3]]: z.object({
    requestArgs: z.array(z.string()).min(1),
  }),
});

export type DeployBlueprintSchema = z.infer<typeof deployBlueprintSchema>;
