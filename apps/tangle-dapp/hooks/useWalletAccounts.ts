import { HexString } from '@polkadot/util/types';
import { encodeAddress } from '@polkadot/util-crypto';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useMemo } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { SubstrateAddress } from '../types/utils';
import assertSubstrateAddress from '../utils/assertSubstrateAddress';
import { isEvmAddress } from '../utils/isEvmAddress';

export type WalletAccount = {
  name: string;
  address: HexString | SubstrateAddress;
};

const useWalletAccounts = (): WalletAccount[] => {
  const { network } = useNetworkStore();
  const { accounts: webContextAccounts } = useWebContext();

  const accounts = useMemo(() => {
    return webContextAccounts.map((account) => {
      let address: HexString | SubstrateAddress;

      if (isEvmAddress(account.address)) {
        address = account.address;
      } else {
        // If it's a Substrate address, encode it using the active
        // network's SS58 prefix.
        const encodedSubstrateAddress =
          network.ss58Prefix !== undefined
            ? encodeAddress(account.address, network.ss58Prefix)
            : account.address;

        address = assertSubstrateAddress(encodedSubstrateAddress);
      }

      return { name: account.name, address } satisfies WalletAccount;
    });
  }, [network.ss58Prefix, webContextAccounts]);

  return accounts;
};

export default useWalletAccounts;
