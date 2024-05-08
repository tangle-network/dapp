import { Option } from '@polkadot/types';
import {
  PalletStakingValidatorPrefs,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';

import { Nominee } from '../../types';

export type CreateNomineeOptions = {
  address: string;
  isActive: boolean;
  identities: Map<string, string | null>;
  prefs: Map<string, PalletStakingValidatorPrefs>;
  exposures: Map<string, Option<SpStakingPagedExposureMetadata>>;
};

const createNominee = (options: CreateNomineeOptions): Nominee => {
  const identityName =
    options.identities.get(options.address) ?? options.address;

  // TODO: Will it ever be unset if the nominee is a validator?
  const commission =
    options.prefs.get(options.address)?.commission.toBn() ?? BN_ZERO;

  // TODO: Will it ever be unset if the nominee is a validator?
  const exposure = options.exposures.get(options.address)?.value ?? null;

  const selfStakeAmount = exposure?.own.toBn() ?? BN_ZERO;
  const totalStakeAmount = exposure?.total.toBn() ?? BN_ZERO;

  // TODO: Will it ever be unset if the nominee is a validator?
  const nominatorCount = exposure?.nominatorCount.toNumber() ?? 0;

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
