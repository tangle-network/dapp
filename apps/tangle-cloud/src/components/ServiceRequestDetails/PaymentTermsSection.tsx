import { FC } from 'react';
import { Address, formatUnits, zeroAddress } from 'viem';
import { SkeletonLoader, Typography } from '@tangle-network/ui-components';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

type Props = {
  paymentToken: Address | undefined;
  paymentAmount: bigint | undefined;
  tokenSymbol: string;
  tokenDecimals: number;
  isLoading: boolean;
};

const PaymentTermsSection: FC<Props> = ({
  paymentToken,
  paymentAmount,
  tokenSymbol,
  tokenDecimals,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Payment Terms
        </Typography>

        <div className="space-y-1">
          <SkeletonLoader className="h-5 w-40" />
          <SkeletonLoader className="h-5 w-32" />
        </div>
      </div>
    );
  }

  const isNativePayment = !paymentToken || paymentToken === zeroAddress;
  const formattedAmount = paymentAmount
    ? addCommasToNumber(
        parseFloat(formatUnits(paymentAmount, tokenDecimals)).toFixed(4),
      )
    : '0';

  return (
    <div className="space-y-2">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
        Payment Terms
      </Typography>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-mono-140 dark:text-mono-80">
            Payment Token:
          </span>
          <span className="text-sm font-semibold">
            {isNativePayment ? 'Native (ETH)' : tokenSymbol}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-mono-140 dark:text-mono-80">
            Payment Amount:
          </span>
          <span className="text-sm font-semibold">
            {formattedAmount} {tokenSymbol}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentTermsSection;
