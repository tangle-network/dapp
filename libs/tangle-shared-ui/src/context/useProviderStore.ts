'use client';

import { create } from 'zustand';

import {
  InjectedAccountWithMeta,
  InjectedExtension,
} from '@polkadot/extension-inject/types';
import {
  EvmAddress,
  SubstrateAddress,
} from '@webb-tools/webb-ui-components/types/address';
import { EIP1193Provider } from 'viem';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

type WalletConnectProvider = Awaited<
  ReturnType<(typeof EthereumProvider)['init']>
>;

type Provider = InjectedExtension | EIP1193Provider | WalletConnectProvider;

const useProviderStore = create<{
  accounts?: InjectedAccountWithMeta[];
  activeAccountAddress?: SubstrateAddress | EvmAddress;
  provider?: Provider;
  setActiveAccountAddress: (address?: SubstrateAddress | EvmAddress) => void;
  setAccounts: (accounts?: InjectedAccountWithMeta[]) => void;
  setProvider: (provider?: Provider) => void;
}>((set) => ({
  setActiveAccountAddress: (account) => set({ activeAccountAddress: account }),
  setAccounts: (accounts) => set({ accounts }),
  setProvider: (provider) => set({ provider }),
}));

export default useProviderStore;
