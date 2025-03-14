import type { Service } from '@tangle-network/tangle-substrate-types';

export default function toPrimitiveService({
  id,
  blueprint,
  owner,
  operatorSecurityCommitments,
  securityRequirements,
  permittedCallers,
  ttl,
  membershipModel,
}: Service) {
  return {
    id: id.toNumber(),
    blueprint: blueprint.toNumber(),
    ownerAccount: owner.toString(),
    operatorSecurityCommitments: operatorSecurityCommitments.map(([operatorId, securityCommitment]) => {
      return {
        operator: operatorId.toString(),
        securityCommitments: securityCommitment.map((commitment) => {
          return {
            type: commitment.asset.toString(),
            exposurePercent: commitment.exposurePercent.toNumber(),
          }
        }),
      }
    }),
    securityRequirements: securityRequirements.map((requirement) => {
      return {
        asset: requirement.asset.toString(),
        minExposurePercent: requirement.minExposurePercent.toNumber(),
        maxExposurePercent: requirement.maxExposurePercent.toNumber(),
      }
    }),
    permittedCallers: permittedCallers.map((caller) => caller.toString()),
    ttl: ttl.toNumber(),
    membershipModel: {
      [membershipModel.type]: {
        minOperators: membershipModel.asFixed.minOperators.toNumber(),
        maxOperators: membershipModel.asDynamic.maxOperators.isSome ? membershipModel.asDynamic.maxOperators.unwrap().toNumber() : null,
      },
    },
  } as const;
}
