import { createContext } from 'react';

export type MintStep = 'input' | 'confirm' | 'send' | 'watch' | 'success';

export interface RenBtcMintContextData {
  step: MintStep;
  setStep: (step: MintStep) => void;
  amount: number;
  setAmount: (value: number) => void;
}

export const RenBtcMintContext = createContext<RenBtcMintContextData>({} as RenBtcMintContextData);
