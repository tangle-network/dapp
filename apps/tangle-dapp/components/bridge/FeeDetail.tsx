import { TokenROUTE } from '@web3icons/react';
import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';
import { TokenIcon } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { Label, Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';

import { BridgeTokenType } from '../../types/bridge/types';

interface FeeDetailProps {
  token: BridgeTokenType;
  amounts: {
    sending: string;
    receiving: string;
    bridgeFee: string;
  };
  estimatedTime: string;
  className?: string;
  showTitle?: boolean;
}

export const FeeDetail = ({
  token,
  amounts,
  estimatedTime,
  className,
  showTitle = true,
}: FeeDetailProps) => {
  return (
    <div
      className={twMerge(
        'rounded-lg p-4 bg-mono-20 dark:bg-mono-180',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        {showTitle && (
          <Label
            className="text-mono-120 dark:text-mono-120 font-bold text-lg"
            htmlFor="bridge-tx-detail"
          >
            Fee Details
          </Label>
        )}

        <div className="flex justify-between items-center">
          <Typography variant="body1" className="!text-lg">
            Bridge
          </Typography>

          <div className="flex items-center gap-1">
            {token.bridgeType === EVMTokenBridgeEnum.Router && (
              <TokenROUTE variant="branded" className="w-6 h-6" />
            )}
            <Typography variant="body1" className="!text-lg">
              {token.bridgeType.charAt(0).toUpperCase() +
                token.bridgeType.slice(1)}
            </Typography>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Typography variant="body1" className="!text-lg">
            Bridge Fee
          </Typography>
          <Typography variant="h5" fw="bold" className="!text-lg">
            {amounts.bridgeFee}
          </Typography>
        </div>

        <div className="flex justify-between items-center">
          <Typography variant="body1" className="!text-lg">
            Sending
          </Typography>
          <Typography variant="h5" fw="bold" className="!text-lg">
            {amounts.sending}
          </Typography>
        </div>

        <div className="flex justify-between items-center">
          <Typography
            variant="body1"
            className="flex items-center gap-2 !text-lg"
          >
            Estimated Time
          </Typography>
          <Typography variant="h5" fw="bold" className="!text-lg">
            ~ {estimatedTime}
          </Typography>
        </div>

        <div className="h-px bg-mono-40 dark:bg-mono-160" />

        <div className="flex justify-between items-center">
          <Typography variant="body1" fw="bold" className="!text-lg">
            Total Receiving
          </Typography>
          <div className="flex items-center gap-2">
            <TokenIcon
              size="lg"
              name={token.tokenType.toLowerCase()}
              className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
            />
            <Typography variant="h5" fw="bold" className="!text-lg">
              {amounts.receiving}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
