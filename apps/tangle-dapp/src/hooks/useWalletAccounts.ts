import { encodeAddress } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { Account } from '@tangle-network/abstract-api-provider';
import { useWebContext } from '@tangle-network/api-provider-environment';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  SolanaAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import assertSolanaAddress from '@tangle-network/ui-components/utils/assertSolanaAddress';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import { useMemo } from 'react';

export type WalletAccount = {
  name: string;
  address: HexString | SubstrateAddress | SolanaAddress;
  originalAccount: Account;
};

const useWalletAccounts = (): WalletAccount[] => {
  const { network } = useNetworkStore();
  const { accounts: webContextAccounts } = useWebContext();

  const accounts = useMemo(() => {
    return webContextAccounts.map((account) => {
      let address: HexString | SubstrateAddress | SolanaAddress;

      if (isSolanaAddress(account.address)) {
        address = assertSolanaAddress(account.address);
      } else if (isEvmAddress(account.address)) {
        address = account.address;
      } else {
        // If SS58 prefix is defined, encode the address with the network prefix
        // If undefined, use the original address
        const addressToAssert =
          network.ss58Prefix !== undefined
            ? encodeAddress(account.address, network.ss58Prefix)
            : account.address;

        address = assertSubstrateAddress(addressToAssert);
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
