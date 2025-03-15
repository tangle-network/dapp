import { assertSubstrateAddress } from '@tangle-network/ui-components';
import createRestakeAssetId from '../../../utils/createRestakeAssetId';
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
    ownerAccount: assertSubstrateAddress(owner.toString()),
    operatorSecurityCommitments: toPrimitiveOperatorSecurityCommitments(
      operatorSecurityCommitments,
    ),
    securityRequirements: toPrimitiveSecurityRequirements(securityRequirements),
    permittedCallers: permittedCallers.map((caller) =>
      assertSubstrateAddress(caller.toString()),
    ),
    ttl: ttl.toNumber(),
    membershipModel: toPrimitiveMembershipModel(membershipModel),
  } as const;
}

export function toPrimitiveOperatorSecurityCommitments(
  operatorSecurityCommitments: Service['operatorSecurityCommitments'],
) {
  return operatorSecurityCommitments.map(([operatorId, securityCommitment]) => {
    return {
      operator: assertSubstrateAddress(operatorId.toString()),
      securityCommitments: securityCommitment.map((commitment) => {
        return {
          asset: createRestakeAssetId(commitment.asset),
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
    return {
      asset: createRestakeAssetId(requirement.asset),
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
