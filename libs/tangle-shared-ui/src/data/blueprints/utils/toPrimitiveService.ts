import { assertSubstrateAddress } from '@tangle-network/ui-components';
import createRestakeAssetId from '../../../utils/createRestakeAssetId';
import type { Service } from '@tangle-network/tangle-substrate-types';
import {
  TanglePrimitivesServicesServiceServiceRequest,
  TanglePrimitivesServicesTypesApprovalState,
} from '@polkadot/types/lookup';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { RestakeAssetId } from '../../../types';
import { StorageKey, u64 } from '@polkadot/types';

export function toPrimitiveService({
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
    id: id.toBigInt(),
    blueprint: blueprint.toBigInt(),
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

export function toPrimitiveServiceRequest(
  requestId: StorageKey<[u64]>,
  {
    blueprint,
    owner,
    securityRequirements,
    ttl,
    args,
    permittedCallers,
    operatorsWithApprovalState,
    membershipModel,
  }: TanglePrimitivesServicesServiceServiceRequest,
) {
  return {
    requestId: requestId.args[0].toNumber(),
    blueprint: blueprint.toNumber(),
    owner: assertSubstrateAddress(owner.toString()),
    securityRequirements: toPrimitiveSecurityRequirements(securityRequirements),
    ttl: ttl.toNumber(),
    // TODO: toPrimitiveArgs(args)
    args: args,
    permittedCallers: permittedCallers.map((caller) =>
      assertSubstrateAddress(caller.toString()),
    ),
    operatorsWithApprovalState: toPrimitiveOperatorsWithApprovalState(
      operatorsWithApprovalState,
    ),
    membershipModel: toPrimitiveMembershipModel(membershipModel),
  } as const;
}

export function toPrimitiveOperatorsWithApprovalState(
  operatorsWithApprovalState: TanglePrimitivesServicesServiceServiceRequest['operatorsWithApprovalState'],
) {
  return operatorsWithApprovalState.map(([operatorId, approvalState]) => {
    const result: {
      operator: SubstrateAddress;
      approvalStateStatus: TanglePrimitivesServicesTypesApprovalState['type'];
      approvalStateValue:
        | undefined
        | {
            asset: RestakeAssetId;
            exposurePercent: number;
          }[];
    } = {
      operator: assertSubstrateAddress(operatorId.toString()),
      approvalStateStatus: approvalState.type,
      approvalStateValue: [],
    };

    switch (approvalState.type) {
      case 'Pending':
      case 'Rejected':
        break;
      case 'Approved':
        result.approvalStateValue =
          approvalState.asApproved.securityCommitments.map((commitment) => {
            return {
              asset: createRestakeAssetId(commitment.asset),
              exposurePercent: commitment.exposurePercent.toNumber(),
            };
          });
        break;
      default:
        throw new Error(`Unknown approval state type: ${approvalState.type}`);
    }

    return result;
  });
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
