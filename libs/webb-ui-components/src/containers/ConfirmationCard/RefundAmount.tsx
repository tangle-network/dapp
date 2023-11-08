import { type FC } from 'react';
import {
  CornerDownRightLine,
  InformationLine,
  WalletLineIcon,
} from '@webb-tools/icons';

import { CopyWithTooltip } from '../../components/CopyWithTooltip/CopyWithTooltip';
import { IconWithTooltip } from '../../components/IconWithTooltip';
import { Typography } from '../../typography';

interface RefundAmountProps {
  amount?: number | string;
  tokenSymbol: string;
  refundAddress?: string;
}

const RefundAmount: FC<RefundAmountProps> = ({
  amount,
  tokenSymbol,
  refundAddress,
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-0.5">
        <CornerDownRightLine className="fill-mono-120 dark:fill-mono-100" />
        <WalletLineIcon className="fill-mono-120 dark:fill-mono-100" />

        <Typography
          variant="utility"
          className="text-mono-120 dark:text-mono-100 break-normal"
        >
          Refund Amount
        </Typography>

        {refundAddress && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-120 dark:fill-mono-100" />
            }
            content={
              <div className="flex flex-col">
                <Typography variant="body3">
                  Refund amount will be sent to: {refundAddress}
                </Typography>

                {/* Currently facing problem when hovering on the icon, the whole tooltip disappear */}
                {/* data-state problem with radix-ui: https://github.com/radix-ui/primitives/discussions/560 */}
                <CopyWithTooltip
                  textToCopy={refundAddress}
                  className="self-end justify-self-end"
                />
              </div>
            }
            overrideTooltipBodyProps={{
              className: 'max-w-[200px]',
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-190 dark:text-mono-40"
        >
          {amount ?? '--'} {tokenSymbol}
        </Typography>

        <IconWithTooltip
          icon={
            <InformationLine className="fill-mono-120 dark:fill-mono-100" />
          }
          content={
            <Typography variant="body3" className="break-normal max-w-max">
              Amount being refunded to recipient.
            </Typography>
          }
          overrideTooltipBodyProps={{ className: 'max-w-[200px]' }}
        />
      </div>
    </div>
  );
};

export default RefundAmount;
