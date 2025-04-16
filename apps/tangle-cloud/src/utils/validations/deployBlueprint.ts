import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import {
  assertSubstrateAddress,
  isEvmAddress,
  isSubstrateAddress,
} from '@tangle-network/ui-components';
import { z, ZodError } from 'zod';
import { Context as ServiceRequestTxContext } from '../../data/services/useServicesRequestTx';
import { toPrimitiveArgsDataType } from '../toPrimitiveArgsDataType';
import {
  Blueprint,
  PrimitiveField,
} from '@tangle-network/tangle-shared-ui/types/blueprint';
import { parseUnits } from 'viem';

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
  metadata: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    deposit: z.string().optional(),
    isFrozen: z.boolean().optional(),
    priceInUsd: z.number().nullable(),
    assetId: z.string(),
    vaultId: z.number().nullable(),
    status: z.enum(['Live', 'Frozen', 'Destroying']).optional(),
    // TODO: add details
    details: z.any().optional(),
  }),
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
          minExposurePercent: z.number().min(1).max(100).default(1),
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
    requestArgs: z.array(z.any()).nullable().optional(),
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
    paymentAmount: z.number().min(1),
  })
  .superRefine((schema, ctx) => {
    if (schema.approvalModel === 'Dynamic') {
      // If approval model is dynamic, `maxApproval` is required
      if (!schema.maxApproval) {
        ctx.addIssue({
          path: ['maxApproval'],
          code: z.ZodIssueCode.custom,
          message: 'Max approval is required for dynamic approval model',
        });

        return z.NEVER;
      }

      // `approvalThreshold` must be less than or equal to the number of operators
      if (schema.minApproval > schema.operators.length) {
        ctx.addIssue({
          path: ['minApproval'],
          code: z.ZodIssueCode.custom,
          message: 'Min approval cannot be greater than number of operators',
        });

        return z.NEVER;
      }
    }

    if (schema.assets.length !== schema.securityCommitments.length) {
      ctx.addIssue({
        path: [`assets`],
        code: z.ZodIssueCode.custom,
        message: 'Assets and security commitments must have the same length',
      });

      return z.NEVER;
    }

    return schema;
  });

export type DeployBlueprintSchema = z.infer<typeof deployBlueprintSchema>;

export const formatServiceRegisterData = (
  blueprintData: Blueprint,
  data: DeployBlueprintSchema,
): ServiceRequestTxContext => {
  let blueprintRequestArgs: PrimitiveField[] = [];
  if (blueprintData.requestParams.length > 0) {
    if (
      !data.requestArgs ||
      blueprintData.requestParams.length !== data.requestArgs?.length
    ) {
      throw new ZodError([
        {
          path: [`requestArgs`],
          code: z.ZodIssueCode.custom,
          message: 'Invalid request args',
        },
      ]);
    }
    blueprintRequestArgs = toPrimitiveArgsDataType(
      blueprintData.requestParams,
      data.requestArgs,
    );
  }

  const paymentAmount = parseUnits(
    data.paymentAmount.toString(),
    data.paymentAsset.metadata.decimals,
  );

  return {
    blueprintId: BigInt(blueprintData.id),
    permittedCallers: data.permittedCallers.map((caller) => {
      // already validated in the schema
      if (!isEvmAddress(caller) && !isSubstrateAddress(caller)) {
        throw new Error('Invalid caller address');
      }

      return caller;
    }),
    operators: data.operators.map((operator) => {
      return assertSubstrateAddress(operator);
    }),
    requestArgs: blueprintRequestArgs,
    securityRequirements: data.securityCommitments,
    assets: data.assets.map((asset) => assertRestakeAssetId(asset.id)),
    ttl: BigInt(data.instanceDuration),
    paymentAsset: assertRestakeAssetId(data.paymentAsset.id),
    paymentValue: paymentAmount,
    membershipModel: data.approvalModel,
    minOperator: data.minApproval,
    maxOperator: data.maxApproval || data.minApproval,
  };
};
