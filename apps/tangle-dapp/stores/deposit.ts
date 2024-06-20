import { create } from 'zustand';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../constants/restake';

type Actions = {
  updateSourceTypedChainId: (chainId: number) => void;
  updateDepositAssetId: (assetId: string) => void;
  updateAmount: (amount: number) => void;
};

type State = {
  sourceTypedChainId: number;
  depositAssetId: string | null;
  amount: number;
  actions: Actions;
};

const useRestakeDepositStore = create<State>((set) => ({
  sourceTypedChainId: SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0],
  depositAssetId: null,
  amount: 0,
  actions: {
    updateSourceTypedChainId: (sourceTypedChainId: number) =>
      set({ sourceTypedChainId }),
    updateDepositAssetId: (depositAssetId: string) => set({ depositAssetId }),
    updateAmount: (amount: number) => set({ amount }),
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
