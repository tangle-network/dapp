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
    operatorSecurityCommitments: toPrimitiveOperatorSecurityCommitments(
      operatorSecurityCommitments,
    ),
    securityRequirements: toPrimitiveSecurityRequirements(securityRequirements),
    permittedCallers: permittedCallers.map((caller) => caller.toString()),
    ttl: ttl.toNumber(),
    membershipModel: toPrimitiveMembershipModel(membershipModel),
  } as const;
}

export function toPrimitiveOperatorSecurityCommitments(
  operatorSecurityCommitments: Service['operatorSecurityCommitments'],
) {
  return operatorSecurityCommitments.map(([operatorId, securityCommitment]) => {
    return {
      operator: operatorId.toString(),
      securityCommitments: securityCommitment.map((commitment) => {
        return {
          asset: {
            type: commitment.asset.type.toString(),
            [commitment.asset.type.toString()]:
              commitment.asset.type === 'Erc20'
                ? commitment.asset.asErc20.toString()
                : commitment.asset.asCustom.toString(),
          },
          exposurePercent: commitment.exposurePercent.toNumber(),
        };
      }),
    };
  });
}

export function toPrimitiveSecurityRequirements(
  securityRequirements: Service['securityRequirements'],
) {
  return securityRequirements.map((requirement) => {
    const assetId =
      requirement.asset.type === 'Erc20'
        ? requirement.asset.asErc20.toString()
        : requirement.asset.asCustom.toString();

    return {
      asset: {
        type: requirement.asset.type.toString(),
        assetId: assetId,
        [requirement.asset.type.toString()]: assetId,
      },
      minExposurePercent: requirement.minExposurePercent.toNumber(),
      maxExposurePercent: requirement.maxExposurePercent.toNumber(),
    };
  });
}

export function toPrimitiveMembershipModel(
  membershipModel: Service['membershipModel'],
) {
  const membershipModelValue = {
    minOperators:
      membershipModel.type === 'Fixed'
        ? membershipModel.asFixed.minOperators.toNumber()
        : membershipModel.asDynamic.minOperators.toNumber(),
    maxOperators:
      membershipModel.type === 'Dynamic' &&
      membershipModel.asDynamic.maxOperators.isSome
        ? membershipModel.asDynamic.maxOperators.unwrap().toNumber()
        : null,
  };
  return {
    type: membershipModel.type,
    membershipModelValue: membershipModelValue,
    [membershipModel.type]: membershipModelValue,
  };
}
