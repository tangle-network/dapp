import { BN } from '@polkadot/util';

import { StakingPayee, Validator } from '../../types';

export type DelegateTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type BondTokensProps = {
  isBondedOrNominating: boolean;
  nominatorAddress: string;
  amountToBondError?: string;
  payeeOptions: StakingPayee[];
  payee: string;
  amountToBond: BN | null;
  tokenSymbol: string;
  setPayee: (payee: StakingPayee) => void;
  setAmountToBond: (amount: BN | null) => void;
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
