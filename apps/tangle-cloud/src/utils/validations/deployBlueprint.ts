import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
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

const restakeAssetSchema = z.custom<RestakeAsset>(
  (val) => {
    if (typeof val !== 'object' || val === null) return false;

    // Check for required properties
    if (!('id' in val) || !('metadata' in val)) return false;

    try {
      assertRestakeAssetId(val.id);
    } catch (error: unknown) {
      console.error(`Asset id ${val.id} is invalid: ${error}`);
      return false;
    }

    return true;
  },
  {
    message: 'Invalid RestakeAsset format',
  },
);

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
    requestArgs: z.array(z.string()).min(1),
  }),
  [BLUEPRINT_DEPLOY_STEPS[3]]: z.object({
    securityCommitments: z.array(z.string()).transform((value, context) => {
      if (value.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one security commitment is required',
        });

        return z.NEVER;
      }

      return value;
    }),
  }),
});

export type DeployBlueprintSchema = z.infer<typeof deployBlueprintSchema>;
