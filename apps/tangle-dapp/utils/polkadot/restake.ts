import { Option } from '@polkadot/types';
import { PalletRolesRestakingLedger } from '@polkadot/types/lookup';

import { DistributionDataType, RestakingProfileType } from '../../types';
import convertRecordToAllocation from '../../utils/convertRecordToAllocation';
import Optional from '../../utils/Optional';

export const getProfileTypeFromRestakeRoleLedger = (
  ledgerOpt: Option<PalletRolesRestakingLedger> | null,
) => {
  if (ledgerOpt === null || ledgerOpt.isNone) {
    return null;
  }

  const ledger = ledgerOpt.unwrap();

  return new Optional(
    ledger.profile.isIndependent
      ? RestakingProfileType.INDEPENDENT
      : RestakingProfileType.SHARED,
  ) satisfies Optional<RestakingProfileType>;
};

export const getRoleDistributionFromRestakeRoleLedger = (
  ledgerOpt: Option<PalletRolesRestakingLedger> | null,
) => {
  if (!ledgerOpt || ledgerOpt.isNone) {
    return null;
  }

  const profile = ledgerOpt.unwrap().profile;

  const records = profile.isIndependent
    ? profile.asIndependent.records
    : profile.asShared.records;

  const distribution = {} as DistributionDataType;

  for (const record of records) {
    const [service, amount] = convertRecordToAllocation(record);

    if (service) {
      distribution[service] = profile.isShared
        ? profile.asShared.amount.toBn()
        : amount;
    }
  }

  return distribution;
};

export const getTotalRestakedFromRestakeRoleLedger = (
  ledgerOpt: Option<PalletRolesRestakingLedger> | null,
) => {
  return ledgerOpt?.isSome ? ledgerOpt.unwrap().total.toBn() : null;
};
