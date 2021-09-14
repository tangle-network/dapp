import { Deposit } from '../utils/make-deposit';

export type AnchorInterface = {
  createDeposit(): Deposit;
  deposit(commitment: string): Promise<void>;
};
