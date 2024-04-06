import { StakingPayee, Validator } from '../../types';

export type DelegateTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type BondTokensProps = {
  isBondedOrNominating: boolean;
  nominatorAddress: string;
  amountToBond: number;
  setAmountToBond: (amount: number) => void;
  amountToBondError?: string;
  amountWalletBalance: number;
  payeeOptions: StakingPayee[];
  payee: string;
  tokenSymbol: string;
  setPayee: (payee: StakingPayee) => void;
};

export type SelectDelegatesProps = {
  validators: Validator[];
  selectedValidators: string[];
  setSelectedValidators: (selectedValidators: string[]) => void;
};

export type AuthorizeTxProps = {
  contractFunc: string;
  contractLink: string;
  nominatorAddress: string;
};

export enum DelegateTxSteps {
  BOND_TOKENS = 'BOND_TOKENS',
  SELECT_DELEGATES = 'SELECT_DELEGATES',
  AUTHORIZE_TX = 'AUTHORIZE_TX',
}
