'use client';

import { create } from 'zustand';

import { InjectedExtension } from '@polkadot/extension-inject/types';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { EIP1193Provider } from 'viem';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { KeypairType } from '@polkadot/util-crypto/types';

type WalletConnectProvider = Awaited<
  ReturnType<(typeof EthereumProvider)['init']>
>;

type Provider =
  | { type: 'substrate'; provider: InjectedExtension }
  | { type: 'evm'; provider: EIP1193Provider }
  | { type: 'walletconnect'; provider: WalletConnectProvider };

type Account =
  | {
      type: 'substrate';
      genesisHash?: string | null;
      name?: string;
      source: string;
      keypairType?: KeypairType;

      /**
       * Note that some Substrate wallets support EVM accounts,
       * such as Talisman.
       */
      address: SubstrateAddress | EvmAddress;
    }
  | { type: 'evm'; address: EvmAddress };

/**
 * Avoid manipulating this state directly, instead prefer using
 * `useWallet`.
 */
const useProviderStore = create<{
  accounts?: Account[];
  activeAccountAddress?: SubstrateAddress | EvmAddress;
  provider?: Provider;
  setActiveAccountAddress: (address?: SubstrateAddress | EvmAddress) => void;
  setAccounts: (accounts?: Account[]) => void;
  setProvider: (provider?: Provider) => void;
}>((set) => ({
  setActiveAccountAddress: (account) => set({ activeAccountAddress: account }),
  setAccounts: (accounts) => set({ accounts }),
  setProvider: (provider) => set({ provider }),
}));

export default useProviderStore;
