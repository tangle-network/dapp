'use client';

import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import {
  ArrowRight,
  ExternalLinkLine,
  ShieldedAssetIcon,
  StatusIndicator,
  TokenIcon,
} from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import useTimeAgo from '../../hooks/useTimeAgo';
import { PropsOf } from '../../types';
import { Typography } from '../../typography';
import { ChainChip } from '../ChainChip/ChainChip';
import { Chip, ChipProps } from '../Chip';
import SteppedProgress from '../Progress/SteppedProgress';
import { Button } from '../buttons';
import { TitleWithInfo } from '../TitleWithInfo';
import AddressChip from '../AddressChip';
import {
  TxInfo,
  TxProgressorBodyProps,
  TxProgressorFooterProps,
  TxProgressorHeaderProps,
  TxProgressorRootProps,
} from './types';

const TxProgressorRoot = forwardRef<
  React.ElementRef<'div'>,
  TxProgressorRootProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge(
        'w-full max-w-lg rounded-lg p-4',
        'bg-mono-0 dark:bg-mono-180',
        className,
      )}
    >
      {children}
    </div>
  );
});
TxProgressorRoot.displayName = 'TxProgressorRoot';

const chipColor: {
  [key in TxProgressorHeaderProps['name']]: ChipProps['color'];
} = {
  Deposit: 'green',
  Transfer: 'purple',
  Withdraw: 'yellow',
};

const TxProgressorHeader = forwardRef<
  React.ElementRef<'div'>,
  TxProgressorHeaderProps
>(({ className, children, name, createdAt = Date.now(), ...props }, ref) => {
  const timeAgo = useTimeAgo({ date: createdAt });

  return (
    <div
      {...props}
      ref={ref}
      className={twMerge('flex items-center justify-between', className)}
    >
      <Chip color={chipColor[name]}>{name}</Chip>

      <Typography variant="body2" className="text-mono-120 dark:text-mono-100">
        {timeAgo}
      </Typography>
    </div>
  );
});
TxProgressorHeader.displayName = 'TxProgressorHeader';

const TxProgressorBodyItem: React.FC<PropsOf<'div'> & TxInfo> = ({
  accountType = 'wallet',
  amount,
  className,
  tokenSymbol,
  tokenType = 'unshielded',
  typedChainId,
  isSource,
  walletAddress,
  tooltipContent,
  ...props
}) => {
  const chain = chainsConfig[typedChainId];

  if (!chain) {
    return null;
  }

  return (
    <div {...props} className={twMerge('space-y-2', className)}>
      <TitleWithInfo
        title={isSource ? 'Source Chain' : 'Destination Chain'}
        variant="utility"
        info={
          tooltipContent ?? (isSource ? 'Source Chain' : 'Destination Chain')
        }
        titleClassName="text-mono-120 dark:text-mono-80"
        className="text-mono-120 dark:text-mono-80"
      />

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <ChainChip
          className="px-2 py-1"
          chainName={chain.name}
          chainType={chain.group}
        />

        {walletAddress && (
          <AddressChip
            address={walletAddress}
            isNoteAccount={accountType === 'note'}
          />
        )}
      </div>

      <div className="flex items-center gap-1">
        <Typography
          variant="h5"
          fw="semibold"
          className="text-mono-200 dark:text-mono-0"
        >
          <b>
            {amount > 0
              ? `+${amount.toFixed(2)}`
              : amount < 0
                ? `-${Math.abs(amount).toFixed(2)}`
                : `${amount.toFixed(2)}`}
          </b>{' '}
          {tokenSymbol}
        </Typography>

        {tokenType === 'shielded' ? (
          <ShieldedAssetIcon size="lg" />
        ) : (
          <TokenIcon name={tokenSymbol} size="lg" />
        )}
      </div>
    </div>
  );
};
TxProgressorBodyItem.displayName = 'TxProgressorBodyItem';

const TxProgressorBody = forwardRef<
  React.ElementRef<'div'>,
  TxProgressorBodyProps
>(({ className, txSourceInfo, txDestinationInfo, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge('flex items-center justify-between mt-2', className)}
    >
      <TxProgressorBodyItem {...txSourceInfo} isSource />

      <ArrowRight size="lg" />

      <TxProgressorBodyItem {...txDestinationInfo} />
    </div>
  );
});
TxProgressorBody.displayName = 'TxProgressorBody';

const TxProgressorFooter = forwardRef<
  React.ElementRef<'div'>,
  TxProgressorFooterProps
>(
  (
    {
      className,
      status,
      steppedProgressProps,
      statusMessage,
      externalUrl,
      actionProps,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        ref={ref}
        className={twMerge('mt-4 space-y-3', className)}
      >
        {steppedProgressProps && <SteppedProgress {...steppedProgressProps} />}

        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1">
            <StatusIndicator animated size={14} variant={status} />

            {statusMessage && (
              <Typography
                variant="body1"
                component="span"
                className="inline-block"
              >
                {statusMessage}
              </Typography>
            )}

            {externalUrl && (
              <a
                href={externalUrl.toString()}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLinkLine />
              </a>
            )}
          </p>

          {actionProps && <Button {...actionProps} variant="link" size="sm" />}
        </div>
      </div>
    );
  },
);
TxProgressorFooter.displayName = 'TxProgressorFooter';

/**
 * The Transaction Progressor component is a component
 * that displays the progress of a transaction.
 *
 * It is composed of 4 components:
 * - `TxProgressor.Root`
 * - `TxProgressor.Header`
 * - `TxProgressor.Body`
 * - `TxProgressor.Footer`
 *
 * @example
 * ```tsx
 * <TxProgressor.Root>
 *  <TxProgressor.Header name="Deposit" createdAt={Date.now()} />
 *    <TxProgressor.Body
 *      txSourceInfo={{
 *        typedChainId: PresetTypedChainId.Goerli,
 *        amount: -1.45,
 *        tokenSymbol: 'WETH',
 *        walletAddress: randEthereumAddress(),
 *      }}
 *      txDestinationInfo={{
 *        typedChainId: PresetTypedChainId.PolygonTestnet,
 *        amount: 1.45,
 *        tokenSymbol: 'webbETH',
 *        tokenType: 'shielded',
 *        accountType: 'note',
 *        walletAddress: randEthereumAddress(),
 *      }}
 *    />
 *    <TxProgressor.Footer
 *      status="info"
 *      statusMessage="Fetching Leaves (15%)"
 *      steppedProgressProps={{
 *        steps: 8,
 *        activeStep: 3,
 *      }}
 *      externalUrl={new URL('https://webb.tools')}
 *      actionProps={{ children: 'Open explorer' }}
 *    />
 *  </TxProgressor.Root>
 * ```
 */
const TxProgressor = Object.assign(
  {},
  {
    Root: TxProgressorRoot,
    Header: TxProgressorHeader,
    Body: TxProgressorBody,
    Footer: TxProgressorFooter,
  },
);

export {
  TxProgressor,
  TxProgressorBody,
  TxProgressorFooter,
  TxProgressorHeader,
  TxProgressorRoot,
};
