import { AddressChipProps } from '../AddressChip/types';

export interface TxConfirmationRingProps {
  source: SourceOrDestination;
  dest: SourceOrDestination;
  poolName: string;
  poolAddress: string;
  poolExplorerUrl?: string;
  className?: string;
}

interface SourceOrDestination extends Omit<AddressChipProps, 'className'> {
  typedChainId: number;
}
