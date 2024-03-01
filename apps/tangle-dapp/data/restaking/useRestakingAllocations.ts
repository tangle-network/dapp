import { PalletRolesProfileRecord } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';

import { RestakingProfileType } from '../../containers/ManageProfileModalContainer/ManageProfileModalContainer';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import { ServiceType } from '../../types';
import useRestakingRoleLedger from './useRestakingRoleLedger';

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

const useRestakingAllocations = (profileType: RestakingProfileType) => {
  const ledgerResult = useRestakingRoleLedger();
  const ledger = ledgerResult.value;

  const allocations: RestakingAllocationMap = {
    [ServiceType.ZK_SAAS_GROTH16]: null,
    [ServiceType.ZK_SAAS_MARLIN]: null,
    [ServiceType.DKG_TSS_CGGMP]: null,
    [ServiceType.TX_RELAY]: null,
  };

  if (ledger !== null) {
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
    value: ledger !== null ? allocations : null,
  };
};

export default useRestakingAllocations;
