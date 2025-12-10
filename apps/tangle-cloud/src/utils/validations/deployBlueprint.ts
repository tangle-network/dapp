import { isEvmAddress } from '@tangle-network/ui-components';
import { z, ZodError } from 'zod';
import { toPrimitiveArgsDataType } from '../toPrimitiveArgsDataType';
import {
  Blueprint,
  PrimitiveField,
} from '@tangle-network/tangle-shared-ui/types/blueprint';
import { parseUnits, Address } from 'viem';

// EVM service request context - compatible with useServiceRequestTx
export type ServiceRequestContext = {
  blueprintId: bigint;
  operators: Address[];
  config: `0x${string}`;
  permittedCallers: Address[];
  ttl: bigint;
  paymentToken: Address;
  paymentAmount: bigint;
};

export const assetSchema = z.object({
  id: z.string().transform((value, ctx) => {
    // For EVM, asset IDs are token addresses
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

      // Validate all operators are EVM addresses
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
    paymentAsset: assetSchema,
    paymentAmount: z.string().regex(/^\d*\.?\d*$/, 'Must be a valid number'),
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

/**
 * Format the deploy blueprint form data into the EVM service request context.
 */
export const formatServiceRequestData = (
  blueprintData: Blueprint,
  data: DeployBlueprintSchema,
): ServiceRequestContext => {
  let config: `0x${string}` = '0x';

  // Encode request args if provided
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
    const requestArgs = toPrimitiveArgsDataType(
      blueprintData.requestParams,
      data.requestArgs,
    );
    // Encode the request args as bytes for the contract
    config = JSON.stringify(requestArgs) as `0x${string}`;
  }

  const paymentAmount = parseUnits(
    data.paymentAmount.toString(),
    data.paymentAsset.metadata.decimals,
  );

  return {
    blueprintId: BigInt(blueprintData.id),
    operators: data.operators as Address[],
    config,
    permittedCallers: data.permittedCallers as Address[],
    ttl: BigInt(data.instanceDuration),
    paymentToken: data.paymentAsset.id as Address,
    paymentAmount,
  };
};
