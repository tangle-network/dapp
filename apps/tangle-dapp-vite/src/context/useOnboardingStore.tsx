import { create } from 'zustand';

const useOnboardingStore = create<{
  onboardingReopenFlag: boolean;
  setOnboardingReopenFlag: (flag: boolean) => void;
}>((set) => ({
  onboardingReopenFlag: false,
  setOnboardingReopenFlag: (onboardingReopenFlag) =>
    set({ onboardingReopenFlag }),
}));

export default useOnboardingStore;
