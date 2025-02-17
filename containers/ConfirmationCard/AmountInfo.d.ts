import { FC } from '../../../../../node_modules/react';
interface AmountInfoProps {
    label: string;
    amount?: number | string;
    tokenSymbol: string;
    tooltipContent?: string;
}
declare const AmountInfo: FC<AmountInfoProps>;
export default AmountInfo;
