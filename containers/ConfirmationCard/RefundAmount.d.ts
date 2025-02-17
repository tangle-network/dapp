import { FC } from '../../../../../node_modules/react';
interface RefundAmountProps {
    amount?: number | string;
    tokenSymbol: string;
    refundAddress?: string;
}
declare const RefundAmount: FC<RefundAmountProps>;
export default RefundAmount;
