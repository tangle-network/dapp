import type { SubstrateAddress } from '../../types/address';

export type ValidatorIdentityProps = {
  address: SubstrateAddress;
  displayCharacterCount?: number;
  identityName?: string;
  accountExplorerUrl?: string;
};
