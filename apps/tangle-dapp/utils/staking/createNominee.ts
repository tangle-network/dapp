import { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';

import { ExposureMapEntry } from '../../data/staking/useStakingExposures2';
import { Nominee } from '../../types';

export type CreateNomineeOptions = {
  address: string;
  isActive: boolean;
  identities: Map<string, string | null>;
  prefs: Map<string, PalletStakingValidatorPrefs>;
  exposures: Map<string, ExposureMapEntry>;
};

const createNominee = (options: CreateNomineeOptions): Nominee => {
  const identityName =
    options.identities.get(options.address) ?? options.address;

  // TODO: Will it ever be unset if the nominee is a validator?
  const commission =
    options.prefs.get(options.address)?.commission.toBn() ?? BN_ZERO;

  // TODO: Will it ever be unset if the nominee is a validator?
  const exposureMeta =
    options.exposures.get(options.address)?.exposureMeta ?? null;

  const selfStakeAmount = exposureMeta?.own.toBn() ?? BN_ZERO;
  const totalStakeAmount = exposureMeta?.total.toBn() ?? BN_ZERO;

  // TODO: Will it ever be unset if the nominee is a validator?
  const nominatorCount = exposureMeta?.nominatorCount.toNumber() ?? 0;

  return {
    address: options.address,
    isActive: options.isActive,
    identityName,
    commission,
    selfStakeAmount,
    totalStakeAmount,
    nominatorCount,
  };
};

export default createNominee;
