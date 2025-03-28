import { isEvmAddress, isSubstrateAddress } from '@tangle-network/ui-components';
import { z } from 'zod';

// origin: OriginFor<T>,
// evm_origin: Option<H160>,
// #[pallet::compact] blueprint_id: u64,
// permitted_callers: Vec<T::AccountId>,
// operators: Vec<T::AccountId>,
// request_args: Vec<Field<T::Constraints, T::AccountId>>,
// asset_security_requirements: Vec<AssetSecurityRequirement<T::AssetId>>,
// #[pallet::compact] ttl: BlockNumberFor<T>,
// payment_asset: Asset<T::AssetId>,
// #[pallet::compact] value: BalanceOf<T>,
// membership_model: MembershipModel,

export const BLUEPRINT_DEPLOY_STEPS = ['step1', 'step2', 'step3', 'step4'] as const;

export const deployBlueprintSchema = z.object({
  [BLUEPRINT_DEPLOY_STEPS[0]]: z.object({
    instanceName: z.string().min(1),
    instanceDuration: z.number().min(1),
    permittedCallers: z.array(z.string())
      .transform((value, context) => {
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
    operators: z.array(z.string()).min(1),
  }),
  [BLUEPRINT_DEPLOY_STEPS[2]]: z.object({
    requestArgs: z.array(z.string()).min(1),
  }),
  [BLUEPRINT_DEPLOY_STEPS[3]]: z.object({
    securityCommitments: z.array(z.string()).min(1),
  }),
});

export type DeployBlueprintSchema = z.infer<typeof deployBlueprintSchema>

