import { EVMTokenBridgeEnum } from '@tangle-network/evm-contract-metadata';
import {
  ChevronDown,
  ExternalLinkLine,
  TokenIcon,
} from '@tangle-network/icons';
import { getFlexBasic } from '@tangle-network/icons/utils';
import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';
import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';

export interface BridgeFeeDetailProps {
  token: BridgeToken;
  amounts: {
    sending: string;
    receiving: string;
    bridgeFee: string;
    gasFee?: string;
  };
  className?: string;
  isCollapsible?: boolean;
  recipientExplorerUrl: string | null;
}

export const BridgeFeeDetail = ({
  token,
  amounts,
  className,
  isCollapsible = true,
  recipientExplorerUrl,
}: BridgeFeeDetailProps) => {
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
          className={cx(
            'group flex items-center justify-between w-full px-4 pt-3 pb-2',
          )}
        >
          <Typography variant="body1" fw="normal">
            Total Receiving
          </Typography>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <TokenIcon
                size="lg"
                name={token.tokenType.toLowerCase()}
                className={cx(`shrink-0 ${getFlexBasic('lg')}`)}
              />

              <Typography
                variant="h5"
                fw="normal"
                className="whitespace-nowrap"
              >
                {amounts.receiving.split(' ')[0].split('.')[0]}
                {amounts.receiving.split(' ')[0].split('.')[1]
                  ? `.${amounts.receiving.split(' ')[0].split('.')[1].slice(0, 4)}`
                  : ''}{' '}
                {amounts.receiving.split(' ')[1]}
              </Typography>
            </div>

            {isCollapsible && (
              <ChevronDown
                size="lg"
                className={cx(
                  'transition-transform duration-300',
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
          <div className="flex flex-col gap-2 px-4 pb-2">
            <div className="h-[2px] bg-mono-40 dark:bg-mono-160" />

            <div className="flex items-center justify-between">
              <Typography variant="body1" fw="normal">
                Sending
              </Typography>

              <Typography
                variant="body1"
                fw="normal"
                className="whitespace-nowrap text-mono-200 dark:text-mono-0"
              >
                {amounts.sending}
              </Typography>
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body1" fw="normal">
                Bridge Fee
              </Typography>

              <Typography
                variant="body1"
                fw="normal"
                className="whitespace-nowrap text-mono-200 dark:text-mono-0"
              >
                {amounts.bridgeFee.split('.')[0]}
                {amounts.bridgeFee.split('.')[1]
                  ? `.${amounts.bridgeFee.split('.')[1].slice(0, 4)}`
                  : ''}{' '}
              </Typography>
            </div>

            <div className="flex items-center justify-between">
              <Typography variant="body1" fw="normal">
                Bridge Route
              </Typography>

              <div className="flex items-center gap-2">
                {token.bridgeType === EVMTokenBridgeEnum.Router ? (
                  <TokenIcon name="router" size="lg" />
                ) : (
                  <TokenIcon name="hyperlane" size="lg" />
                )}

                <Typography
                  variant="body1"
                  fw="normal"
                  className="whitespace-nowrap text-mono-200 dark:text-mono-0"
                >
                  {token.bridgeType.charAt(0).toUpperCase() +
                    token.bridgeType.slice(1)}
                </Typography>
              </div>
            </div>

            {amounts.gasFee && (
              <div className="flex items-center justify-between">
                <Typography variant="body1" fw="normal">
                  Gas Fee
                </Typography>

                <Typography
                  variant="body1"
                  fw="normal"
                  className="whitespace-nowrap text-mono-200 dark:text-mono-0"
                >
                  {amounts.gasFee}
                </Typography>
              </div>
            )}

            {recipientExplorerUrl && (
              <div className="flex items-center justify-between">
                <Typography variant="body1" fw="normal">
                  Recipient
                </Typography>

                <a
                  href={recipientExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1"
                >
                  <Typography
                    variant="body1"
                    fw="normal"
                    className="whitespace-nowrap text-mono-200 dark:text-mono-0"
                  >
                    {shortenHex(recipientExplorerUrl)}
                  </Typography>

                  <ExternalLinkLine className="size-4" />
                </a>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
