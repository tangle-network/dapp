import { AddressChipProps } from '../AddressChip/types';

export interface TxConfirmationRingProps {
  source: SourceOrDestination;
  dest: SourceOrDestination;
  title: string;
  subtitle?: string;
  externalLink?: string;
  className?: string;
}

interface SourceOrDestination extends Omit<AddressChipProps, 'className'> {
  typedChainId?: number;
}
