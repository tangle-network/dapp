import {
  ArrowRight,
  ExternalLinkLine,
  ShieldKeyholeLineIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import Lottie from 'lottie-react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '../../components/buttons';
import { Chip, ChipColors } from '../../components/Chip';
import { Disclaimer } from '../../components/Disclaimer';
import { Typography } from '../../typography';
import { TransactionCardFooter } from './TransactionCardFooter';
import success from './success-tx.json';
import { BridgeLabel, NativeLabel, TransactionCardItemProps } from './types';

type Variant = 'bridge' | 'native';
const sectionPadding = 'py-2  px-4 m-0 mt-0';

/**
 *
 * TransactionProgressCard
 * @description A card component that represent the status change of a transaction over time
 *
 * @example Transfer transaction card when the transaction is done
 *  ```jsx
 *  <TransactionProgressCard
 method={'Transfer'}
 firedAt={new Date()}
 status={'in-progress'}
 tokens={[<TokenIcon size={'lg'} name={'ETH'} />, <TokenIcon size={'lg'} name={'WEBB'} />]}
 wallets={{ src: <ChainIcon name="polygon mumbai" />, dist: <ChainIcon name="ethereum" /> }}
 label={{
                  tokenURI: 'https://polygon.technology/',
                  amount: '0.999',
                  token: 'ETH/WETH',
                }}
 onDismiss={() => {}}
 footer={{
                  isLoading: false,
                  message: (
                    <>
                      <span className={'inline-block pr-2'}>🎉</span>Successfully Transfer!
                    </>
                  ),
                }}
 onDetails={() => {}}
 />
 *  ```
 *  @example Withdraw transaction card when generating the zero knowledge proof
 *
 *  ```jsx
 *  <TransactionProgressCard
 method={'Withdraw'}
 firedAt={new Date()}
 status={'in-progress'}
 syncNote={() => {}}
 tokens={[<TokenIcon size={'lg'} name={'ETH'} />]}
 wallets={{ src: <ChainIcon name="polygon mumbai" />, dist: <WalletLine width={16} height={14.6} /> }}
 label={{
                  amount: '0.999',
                  nativeValue: '1430',
                }}
 onDismiss={() => {}}
 footer={{
                  isLoading: true,
                  message: 'Generating ZK  proofs..',
                }}
 onDetails={() => {}}
 />
 *  ```
 *
 *  @example Deposit transaction card when the transaction has failed
 *
 *   ```jsx
 *   <TransactionProgressCard
 method={'Deposit'}
 firedAt={new Date()}
 status={'in-progress'}
 tokens={[<TokenIcon size={'lg'} name={'WEBB'} />, <TokenIcon size={'lg'} name={'ETH'} />]}
 wallets={{ src: <ChainIcon name="polygon mumbai" />, dist: <ChainIcon name="ethereum" /> }}
 label={{
                    tokenURI: 'https://polygon.technology/',
                    amount: '0.999',
                    token: 'ETH/WEBB',
                  }}
 onDismiss={() => {}}
 footer={{
                    isLoading: false,
                    hasWarning: true,
                    link: {
                      uri: '#',
                      text: (
                        <>
                          <span
                            className={'inline-block pr-2'}
                            style={{
                              fontSize: 18,
                            }}
                          >
                            ⚠️
                          </span>
                          Deposit Failed
                        </>
                      ),
                    },
                  }}
 onDetails={() => {}}
 />
 *   ```
 *
 *
 * */
export const TransactionProgressCard = forwardRef<
  HTMLDivElement,
  TransactionCardItemProps
>(
  (
    {
      className,
      status,
      label,
      tokens,
      onSyncNote,
      method,
      wallets,
      onDismiss,
      onDetails,
      firedAt,
      footer,

      ...props
    },
    ref
  ) => {
    const labelVariant = useMemo<Variant>(
      () => ((label as NativeLabel).nativeValue ? 'native' : 'bridge'),
      [label]
    );

    const timeLabel = useMemo(() => {
      const timeGap = Date.now() - firedAt.getTime();
      if (timeGap < 60 * 1000) {
        return 'Just now';
      }
      if (timeGap < 60 * 60 * 1000) {
        return `${Math.floor(timeGap / (1000 * 60))}m`;
      }
      if (timeGap > 60 * 60 * 1000) {
        return `${Math.floor(timeGap / (1000 * 60 * 60))}h`;
      }
    }, [firedAt]);

    const chipColor = useMemo<ChipColors>((): ChipColors => {
      switch (method) {
        case 'Withdraw':
          return 'purple';
        case 'Deposit':
          return 'yellow';
        case 'Transfer':
          return 'green';
      }
      return 'red';
    }, [method]);

    const [SourceIcon, DistIcon] = useMemo(() => {
      switch (method) {
        case 'Withdraw':
          return [
            <ShieldKeyholeLineIcon size={'lg'} />,
            <WalletLineIcon size={'lg'} />,
          ];
        case 'Deposit':
          return [
            <WalletLineIcon size={'lg'} />,
            <ShieldKeyholeLineIcon size={'lg'} />,
          ];
        case 'Transfer':
          return [
            <ShieldKeyholeLineIcon size={'lg'} />,
            <ShieldKeyholeLineIcon size={'lg'} />,
          ];
      }
    }, [method]);

    const hasSyncNote = useMemo(() => {
      return method === 'Withdraw' && Boolean(onSyncNote);
    }, [method, onSyncNote]);

    // Fix lottie animation prevents the image form loading ?!
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
      let t: ReturnType<typeof setTimeout>;
      if (status === 'completed') {
        t = setTimeout(() => setShowAnimation(true), 100);
      } else {
        setShowAnimation(false);
      }
      return () => clearTimeout(t);
    }, [status, setShowAnimation]);

    return (
      <div
        className={twMerge(
          `border-t border-mono-80 dark:border-mono-120 relative`,
          className
        )}
        {...props}
        ref={ref}
      >
        {/*Show the animation for the completed transactions*/}
        {showAnimation && (
          <div className={`absolute inset-0 overflow-hidden`}>
            <Lottie animationData={success} />
          </div>
        )}
        {/*Main card content*/}
        <div className="relative flex flex-col z-1">
          {/*Card Header*/}
          <div className={twMerge('my-0 flex items-center', sectionPadding)}>
            <div className={'basis-full'}>
              <Chip color={chipColor}>{method}</Chip>
            </div>
            <Typography
              fw={'semibold'}
              variant={'body1'}
              className={'whitespace-nowrap uppercase'}
            >
              {timeLabel}
            </Typography>
          </div>
          {/*Card Content*/}
          <div className={twMerge('my-0 flex items-center', sectionPadding)}>
            <div className="flex items-start">
              <div className={'h-full'}>{tokens}</div>
              <div className={'px-3'}>
                <Typography
                  variant={'h4'}
                  fw={'bold'}
                  className={'py-0 text-mono-200'}
                >
                  {label.amount}
                </Typography>
                {labelVariant === 'native' ? (
                  <Typography
                    variant={'h5'}
                    fw={'bold'}
                    className={'py-0 text-mono-100'}
                  >
                    {(label as NativeLabel).nativeValue} USD
                  </Typography>
                ) : (
                  <a
                    rel="noopener noreferrer"
                    href={(label as BridgeLabel).tokenURI}
                    target="_blank"
                  >
                    <Typography
                      variant={'body1'}
                      fw={'bold'}
                      className="flex items-center py-0 text-mono-200"
                    >
                      {(label as BridgeLabel).token}
                      <ExternalLinkLine className="!fill-current inline whitespace-nowrap ml-1" />
                    </Typography>
                  </a>
                )}
              </div>
            </div>
            <div className={'h-full self-start items-end grow flex flex-col'}>
              {hasSyncNote && (
                <Button variant={'link'} size={'sm'} onClick={onSyncNote}>
                  SYNC NOTE
                </Button>
              )}

              <div className="flex items-center mt-1">
                <div
                  className={` rounded-full flex items-center justify-center h-6 w-6 relative`}
                >
                  {SourceIcon}
                  <div className={'h-3 w-3 absolute  top-0 right-0'}>
                    {wallets.src}
                  </div>
                </div>
                <div className="px-2">
                  <ArrowRight />
                </div>
                <div
                  className={` rounded-full flex items-center justify-center h-6 w-6 relative`}
                >
                  {DistIcon}
                  <div className={'h-3 w-3 absolute  top-0 right-0'}>
                    {wallets.dist}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Card Info or Disclaimer*/}
        {hasSyncNote && (
          <div className={sectionPadding}>
            <Disclaimer
              variant={'info'}
              message={
                'New spend note is added to your account to reflect updated balance on Webb.'
              }
            />
          </div>
        )}
        {/*Card Footer*/}
        <div className="relative flex flex-col z-1">
          <TransactionCardFooter
            {...footer}
            onDismiss={onDismiss}
            onDetails={onDetails}
          />
        </div>
      </div>
    );
  }
);
