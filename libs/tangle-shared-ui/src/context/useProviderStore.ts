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

const useProviderStore = create<{
  accounts?: InjectedAccountWithMeta[];
  activeAccountAddress?: SubstrateAddress | EvmAddress;
  provider?: InjectedExtension | EIP1193Provider;
  setActiveAccountAddress: (address?: SubstrateAddress | EvmAddress) => void;
  setAccounts: (accounts?: InjectedAccountWithMeta[]) => void;
  setProvider: (provider?: InjectedExtension | EIP1193Provider) => void;
}>((set) => ({
  setActiveAccountAddress: (account) => set({ activeAccountAddress: account }),
  setAccounts: (accounts) => set({ accounts }),
  setProvider: (provider) => set({ provider }),
}));

export default useProviderStore;
