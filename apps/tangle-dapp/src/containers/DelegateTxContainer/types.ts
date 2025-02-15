import { BN } from '@polkadot/util';
import { Validator } from '@tangle-network/tangle-shared-ui/types';
import {
  StakingRewardsDestination,
  StakingRewardsDestinationDisplayText,
} from '../../types';

export type DelegateTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type BondTokensProps = {
  isBondedOrNominating: boolean;
  amountToBondError?: string;
  payeeOptions: StakingRewardsDestinationDisplayText[];
  payee: StakingRewardsDestination;
  amountToBond: BN | null;
  tokenSymbol: string;
  setPayee: (payee: StakingRewardsDestination) => void;
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
