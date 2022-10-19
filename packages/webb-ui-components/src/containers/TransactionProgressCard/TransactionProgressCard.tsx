import { TransactionProgressCardProps } from '@webb-dapp/webb-ui-components/containers/TransactionProgressCard/types';
import { forwardRef } from 'react';
/**
 *
 * TransactionProgressCard
 * */
export const TransactionProgressCard = forwardRef<HTMLDivElement, TransactionProgressCardProps>(({ ...props }, ref) => {
  return <div {...props} ref={ref}></div>;
});
