import { PalletStakingValidatorPrefs } from '@polkadot/types/lookup';
import { BN, BN_ZERO } from '@polkadot/util';
import { Validator } from '@webb-tools/tangle-shared-ui/types';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

// TODO: Simplify this down to the most essential/required parameters.
export type CreateNomineeOptions = {
  address: SubstrateAddress;
  isActive: boolean;
  identities: Map<string, string | null>;
  prefs: Map<string, PalletStakingValidatorPrefs>;
  getExposure: (address: SubstrateAddress) =>
    | {
        own: BN;
        total: BN;
        nominatorCount: number;
      }
    | undefined;
};

const createValidator = (options: CreateNomineeOptions): Validator => {
  const identityName =
    options.identities.get(options.address) ?? options.address;

  // TODO: Will it ever be unset if the nominee is a validator?
  const commission =
    options.prefs.get(options.address)?.commission.toBn() ?? BN_ZERO;

  const exposure = options.getExposure(options.address);

  // TODO: Will it ever be unset if the nominee is a validator?
  const nominatorCount = exposure?.nominatorCount ?? 0;

  return {
    address: options.address,
    isActive: options.isActive,
    identityName,
    commission,
    selfStakeAmount: exposure?.own ?? BN_ZERO,
    totalStakeAmount: exposure?.total ?? BN_ZERO,
    nominatorCount,
  };
};

export default createValidator;
