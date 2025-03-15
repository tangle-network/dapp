import { create } from 'zustand';

type State = {
  isStaking: boolean;
  lsPoolId: number | null;
};

type Actions = {
  setIsStaking: (isStaking: State['isStaking']) => void;
  setLsPoolId: (poolId: number) => void;
};

type Store = State & Actions;

export const useLsStore = create<Store>((set) => ({
  isStaking: true,
  lsPoolId: null,
  setIsStaking: (isStaking) => set({ isStaking }),
  setLsPoolId: (lsPoolId) => set({ lsPoolId }),
}));
