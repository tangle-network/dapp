import { create } from 'zustand';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';

const useBlueprintStore = create<{
  selection: Blueprint['id'][];
  setSelection: (selection: Blueprint['id'][]) => void;
}>((set) => ({
  selection: [],
  setSelection: (selection) => set({ selection }),
}));

export default useBlueprintStore;
