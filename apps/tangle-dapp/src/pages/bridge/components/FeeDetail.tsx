import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';
import { TokenIcon } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
  InfoIconWithTooltip,
  Label,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';

import { BridgeToken } from '@webb-tools/tangle-shared-ui/types';

export interface FeeDetailProps {
  token: BridgeToken;
  amounts: {
    sending: string;
    receiving: string;
    bridgeFee: string;
    gasFee?: string;
  };
  estimatedTime?: string;
  className?: string;
  isCollapsible?: boolean;
  bridgeFeeTokenType: string;
  gasFeeTokenType?: string;
}

export const FeeDetail = ({
  token,
  amounts,
  estimatedTime,
  className,
  isCollapsible = true,
  bridgeFeeTokenType,
  gasFeeTokenType,
}: FeeDetailProps) => {
  return (
    <Accordion
      type="single"
      collapsible={isCollapsible}
      className={twMerge(
        'rounded-lg w-full bg-mono-20 dark:bg-mono-180',
        className,
      )}
    >
      <AccordionItem value="fee-details" className="p-0">
        <AccordionButtonBase
          className={cx('group flex items-center justify-between w-full p-4')}
        >
          <Typography variant="body1">Fee</Typography>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {token.bridgeType === EVMTokenBridgeEnum.Router ? (
                <TokenIcon
                  size="lg"
                  name={token.tokenType.toLowerCase()}
                  className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
                />
              ) : (
                <TokenIcon
                  size="lg"
                  name={bridgeFeeTokenType?.toLowerCase()}
                  className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
                />
              )}

              <Typography
                variant="body1"
                className="text-mono-0 dark:text-mono-0 whitespace-nowrap"
              >
                {amounts.bridgeFee.split('.')[0]}.
                {amounts.bridgeFee.split('.')[1].slice(0, 4)}{' '}
                {bridgeFeeTokenType}
              </Typography>
            </div>

            {isCollapsible && (
              <ChevronDownIcon
                className={cx(
                  'w-5 h-5 text-mono-120 dark:text-mono-100 transition-transform duration-300',
                  'group-radix-state-open:rotate-180',
                  'group-radix-state-closed:rotate-0',
                )}
              />
            )}
          </div>
        </AccordionButtonBase>

        <AccordionContent
          className={cx(
            'overflow-hidden px-0 py-1',
            'radix-state-open:animate-accordion-slide-down',
            'radix-state-closed:animate-accordion-slide-up',
          )}
        >
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex items-center justify-between">
              <Typography variant="body1">Bridge</Typography>

              <div className="flex items-center gap-1">
                {token.bridgeType === EVMTokenBridgeEnum.Router ? (
                  <TokenIcon name="router" size="lg" />
                ) : (
                  <TokenIcon name="hyperlane" size="lg" />
                )}

                <Typography variant="body1">
                  {token.bridgeType.charAt(0).toUpperCase() +
                    token.bridgeType.slice(1)}
                </Typography>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body1">Amount</Typography>

              <div className="flex items-center gap-1">
                <TokenIcon
                  size="lg"
                  name={token.tokenType.toLowerCase()}
                  className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
                />

                <Typography
                  variant="body1"
                  className="text-mono-0 dark:text-mono-0 whitespace-nowrap"
                >
                  {amounts.sending}
                </Typography>
              </div>
            </div>

            {estimatedTime !== undefined && (
              <div className="flex items-center justify-between">
                <Typography variant="body1">Estimated Time</Typography>

                <Typography
                  variant="body1"
                  className="text-mono-0 dark:text-mono-0"
                >
                  ~30min or more
                </Typography>
              </div>
            )}

            {amounts.gasFee && (
              <div className="flex items-center justify-between">
                <Typography variant="body1">Gas Fee</Typography>

                <div className="flex items-center gap-2">
                  <Typography
                    variant="body1"
                    className="text-mono-0 dark:text-mono-0"
                  >
                    {amounts.gasFee}
                  </Typography>

                  <TokenIcon
                    size="lg"
                    name={gasFeeTokenType?.toLowerCase()}
                    className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
                  />
                </div>
              </div>
            )}

            <div className="h-px bg-mono-40 dark:bg-mono-160" />

            <div className="flex items-center justify-between">
              <Typography variant="body1">Total Receiving</Typography>

              <div className="flex items-center gap-1">
                <TokenIcon
                  size="lg"
                  name={token.tokenType.toLowerCase()}
                  className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
                />

                <Typography
                  variant="body1"
                  className="text-mono-0 dark:text-mono-0 whitespace-nowrap"
                >
                  {amounts.receiving.split('.')[0]}.
                  {amounts.receiving.split('.')[1].slice(0, 4)}{' '}
                  {bridgeFeeTokenType}
                </Typography>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
