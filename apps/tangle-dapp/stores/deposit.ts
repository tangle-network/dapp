import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { create } from 'zustand';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../constants/restake';

type Actions = {
  updateSourceTypedChainId: (chainId: number) => void;
  updateDepositAssetId: (assetId: string) => void;
  updateAmount: (amount: bigint) => void;
};

type State = {
  sourceTypedChainId: number;
  depositAssetId: string | null;
  amount: bigint;
  actions: Actions;
};

const useRestakeDepositStore = create<State>((set) => ({
  sourceTypedChainId: SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0],
  depositAssetId: null,
  amount: ZERO_BIG_INT,
  actions: {
    updateSourceTypedChainId: (sourceTypedChainId: number) =>
      set({ sourceTypedChainId }),
    updateDepositAssetId: (depositAssetId: string) => set({ depositAssetId }),
    updateAmount: (amount: bigint) => set({ amount }),
  },
}));

const useDepositAssetId = () =>
  useRestakeDepositStore((state) => state.depositAssetId);

const useSourceTypedChainId = () =>
  useRestakeDepositStore((state) => state.sourceTypedChainId);

const useActions = () => useRestakeDepositStore((state) => state.actions);

const useAmount = () => useRestakeDepositStore((state) => state.amount);

export type { Actions, State };

export { useActions, useAmount, useDepositAssetId, useSourceTypedChainId };
