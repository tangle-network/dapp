import { PropsOf } from '@webb-tools/webb-ui-components/types';

export interface DepositContainerProps extends PropsOf<'div'> {
  // Actions to take on 'deposit' button click
  // (e.g. generateNote for passing to the <DepositConfirm />)
  onDeposit?: () => void;
}
