import { BN } from '@polkadot/util';

import { Validator } from '../../types';

export type DelegateTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type BondTokensProps = {
  isFirstTimeNominator: boolean;
  nominatorAddress: string;
  amountToBond: BN | null;
  setAmountToBond: (amount: BN | null) => void;
  paymentDestinationOptions: string[];
  paymentDestination: string;
  setPaymentDestination: (paymentDestination: string) => void;
  tokenSymbol: string;
  walletBalance: BN | null;
  handleAmountToBondError: (error: string | null) => void;
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
}
