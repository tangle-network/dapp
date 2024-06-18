import { create } from 'zustand';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../constants/restake';

type Actions = {
  updateSourceTypedChainId: (chainId: number) => void;
  updateDepositAssetId: (assetId: string) => void;
};

type State = {
  sourceTypedChainId: number;
  depositAssetId: string | null;
  actions: Actions;
};

const useRestakeDepositStore = create<State>((set) => ({
  sourceTypedChainId: SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0],
  depositAssetId: null,
  actions: {
    updateSourceTypedChainId: (sourceTypedChainId: number) =>
      set({ sourceTypedChainId }),
    updateDepositAssetId: (depositAssetId: string) => set({ depositAssetId }),
  },
}));

const useDepositAssetId = () =>
  useRestakeDepositStore((state) => state.depositAssetId);

const useSourceTypedChainId = () =>
  useRestakeDepositStore((state) => state.sourceTypedChainId);

const useActions = () => useRestakeDepositStore((state) => state.actions);

export type { Actions, State };

export { useActions, useDepositAssetId, useSourceTypedChainId };
