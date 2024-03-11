import { PalletRolesProfileRecord } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';

import { RestakingProfileType } from '../../containers/ManageProfileModalContainer/ManageProfileModalContainer';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import { ServiceType } from '../../types';
import useRestakingRoleLedger from './useRestakingRoleLedger';

/**
 * Given a roles profile record (a tuple originating from chain,
 * consisting of a role and its restaked amount), convert it to
 * a tuple that this application can work with, which includes
 * the role type as an enum, and the amount restaked in that role.
 *
 * The main reason why this is needed is because the role types provided
 * by Polkadot JS are in a tedious format, which is a consequence of
 * Rust's sum type enums, which are not straightforward to map to
 * JavaScript/TypeScript.
 */
function convertRecordToAllocation(
  record: PalletRolesProfileRecord
): [ServiceType, BN] {
  // TODO: Need to investigate under what conditions the amount can be `None`. What would `None` mean in this context? A good idea would be to check the Rust code & logic to see how the `updateProfile` call is implemented & handled for records with no amount.
  if (record.amount.isNone) {
    throw new Error('Records with no amount are not supported');
  }

  let serviceType: ServiceType | null = null;

  if (record.role.isZkSaaS) {
    const zksassRole = record.role.asZkSaaS;

    if (zksassRole.isZkSaaSGroth16) {
      serviceType = ServiceType.ZK_SAAS_GROTH16;
    } else if (zksassRole.isZkSaaSMarlin) {
      serviceType = ServiceType.ZK_SAAS_MARLIN;
    }
  } else if (record.role.isTss) {
    // TODO: There are many more Tss roles displayed in the Polkadot/Substrate Portal. Is this truly all to be supported for now?
    serviceType = ServiceType.DKG_TSS_CGGMP;
  } else if (record.role.isLightClientRelaying) {
    serviceType = ServiceType.TX_RELAY;
  }

  if (serviceType === null) {
    // Because of the structure of the provided types (not being an enum),
    // an error needs to be thrown. This is not ideal compared to using a
    // switch statement which would provide exhaustive static type checking.
    throw new Error(
      'Unknown role type (was a new role added? if so, update this function)'
    );
  }

  return [serviceType, record.amount.unwrap()];
}

/**
 * Obtain the roles and their allocation amounts of the
 * active account from chain, for either independent or
 * shared profile.
 *
 * These roles help identify what kind of jobs the active
 * account performs. The amounts corresponding to each job
 * represent their staked amount for that role ('restaking'
 * amount). Higher amounts provide higher crypto economic security
 * because that means higher amounts can be slashed.
 *
 * If the active account does not have a profile setup,
 * `null` will be returned for the value.
 */
const useRestakingAllocations = (profileType: RestakingProfileType) => {
  const ledgerResult = useRestakingRoleLedger();
  const ledgerOpt = ledgerResult.data;
  const isLedgerAvailable = ledgerOpt !== null && ledgerOpt.isSome;

  const allocations: RestakingAllocationMap = {
    [ServiceType.ZK_SAAS_GROTH16]: null,
    [ServiceType.ZK_SAAS_MARLIN]: null,
    [ServiceType.DKG_TSS_CGGMP]: null,
    [ServiceType.TX_RELAY]: null,
  };

  if (isLedgerAvailable) {
    const ledger = ledgerOpt.unwrap();

    const profile =
      profileType === RestakingProfileType.Independent
        ? ledger.profile.isIndependent
          ? ledger.profile.asIndependent
          : null
        : ledger.profile.isShared
        ? ledger.profile.asShared
        : null;

    if (profile !== null) {
      for (const record of profile.records) {
        const [service, amount] = convertRecordToAllocation(record);

        allocations[service] = amount;
      }
    }
  }

  return {
    ...ledgerResult,
    value: isLedgerAvailable ? allocations : null,
  };
};

export default useRestakingAllocations;
