import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export const ExchangeRateInfo: FC<{
  exchangeRate: number | string;
  fungibleTokenSymbol?: string;
  nativeTokenSymbol?: string;
}> = ({ exchangeRate, fungibleTokenSymbol, nativeTokenSymbol }) => {
  return (
    <div className="max-w-[185px] break-normal">
      <Typography variant="body3" fw="bold">
        Exchange Rate:
      </Typography>
      <Typography variant="body3">
        1 {nativeTokenSymbol} = {exchangeRate} {fungibleTokenSymbol}
      </Typography>

      <Typography className="mt-6" variant="body3">
        <b>Note:</b> rates may change based on network activity; received token
        amounts will adjust accordingly.
      </Typography>
    </div>
  );
};

export const TransactionFeeInfo: FC<{
  estimatedFee: number | string;
  refundFee?: number | string;
  fungibleTokenSymbol?: string;
}> = ({ estimatedFee, refundFee, fungibleTokenSymbol }) => {
  return (
    <div className="break-normal">
      <Typography variant="body3">
        Transaction Fee:{' '}
        <b>
          {estimatedFee} {fungibleTokenSymbol ?? ''}
        </b>
      </Typography>

      {refundFee && (
        <Typography variant="body3" className="mt-2">
          Refund Fee:{' '}
          <b>
            {refundFee} {fungibleTokenSymbol ?? ''}
          </b>
        </Typography>
      )}
    </div>
  );
};
