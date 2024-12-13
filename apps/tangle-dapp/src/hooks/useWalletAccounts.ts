import { encodeAddress } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { Account } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { isEvmAddress } from '@webb-tools/webb-ui-components/utils/isEvmAddress20';
import { useMemo } from 'react';

export type WalletAccount = {
  name: string;
  address: HexString | SubstrateAddress;
  originalAccount: Account;
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

      return {
        name: account.name,
        address,
        originalAccount: account,
      } satisfies WalletAccount;
    });
  }, [network.ss58Prefix, webContextAccounts]);

  return accounts;
};

export default useWalletAccounts;
