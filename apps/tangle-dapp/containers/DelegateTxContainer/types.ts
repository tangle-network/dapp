import { ValidatorType } from '../../types';

export type DelegateTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type BondTokensProps = {
  isFirstTimeNominator: boolean;
  nominatorAddress: string;
  amountToBond: number;
  setAmountToBond: (amount: number) => void;
  amountToBondError?: string;
  amountWalletBalance: number;
  paymentDestinationOptions: string[];
  paymentDestination: string;
  setPaymentDestination: (paymentDestination: string) => void;
};

export type SelectDelegatesProps = {
  validators: ValidatorType[];
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
