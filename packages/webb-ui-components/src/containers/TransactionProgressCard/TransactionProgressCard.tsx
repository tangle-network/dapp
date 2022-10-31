import { Button, Chip, Disclaimer } from '../../components';
import { ArrowRight, ExternalLinkLine } from '../../icons';
import { Typography } from '../../typography';
import React, { forwardRef, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { BridgeLabel, NativeLabel, TransactionCardItemProps } from './types';
import success from './success-tx.json';
import Lottie from 'lottie-react';
import { TransactionCardFooter } from './TransactionCardFooter';
import { ChipColors } from '@webb-dapp/webb-ui-components/components/Chip/types';

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
 wallets={{ src: <PolygonLogo />, dist: <EthLogo /> }}
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
 wallets={{ src: <PolygonLogo />, dist: <WalletLine width={16} height={14.6} /> }}
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
 *  @example Deposit transaction card when the transction has failed
 *
 *   ```jsx
 *   <TransactionProgressCard
 method={'Deposit'}
 firedAt={new Date()}
 status={'in-progress'}
 tokens={[<TokenIcon size={'lg'} name={'WEBB'} />, <TokenIcon size={'lg'} name={'ETH'} />]}
 wallets={{ src: <PolygonLogo />, dist: <EthLogo /> }}
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
export const TransactionProgressCard = forwardRef<HTMLDivElement, TransactionCardItemProps>(
  ({ className, status, label, tokens, onSyncNote, method, wallets, onDismiss, onDetails, ...props }, ref) => {
    const labelVariant = useMemo<Variant>(() => ((label as NativeLabel).nativeValue ? 'native' : 'bridge'), [label]);
    const [open, setOpen] = useState(true);
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

    const hasSyncNote = useMemo(() => {
      return method === 'Withdraw' && Boolean(onSyncNote);
    }, [method]);

    return (
      <div
        className={twMerge(
          `border-t border-mono-80 dark:border-mono-120
          relative
            `,
          className
        )}
        {...props}
        ref={ref}
      >
        {/*Show the animation for the completed transactions*/}
        {status === 'completed' && (
          <div className={`dark:bg-mono-160 absolute inset-0 h-full w-full z-0`}>
            <Lottie animationData={success} />
          </div>
        )}
        {/*Main card content*/}
        <div className='flex flex-col relative z-1'>
          {/*Card Header*/}
          <div className={twMerge('my-0 flex items-center', sectionPadding)}>
            <div className={'basis-full'}>
              <Chip color={chipColor}>{method}</Chip>
            </div>
            <Typography fw={'bold'} variant={'body3'} className={'whitespace-nowrap'}>
              JUST NOW
            </Typography>
          </div>
          {/*Card Content*/}
          <div className={twMerge('my-0 flex items-center', sectionPadding)}>
            <div className={'h-full self-start'}>
              <div className={'h-full self-start w-8 '}>
                <div className={'relative'}>
                  {tokens[0] && <div className={'absolute h-5 w-5 inset-0'}>{tokens[0]}</div>}
                  {tokens[1] && <div className={'absolute h-5 w-5 inset-x-2'}>{tokens[1]}</div>}
                </div>
              </div>
            </div>
            <div className={'px-2'}>
              <Typography variant={'h5'} fw={'bold'} className={'py-0 text-mono-200'}>
                {label.amount}
              </Typography>
              {labelVariant === 'native' ? (
                <Typography variant={'body4'} fw={'bold'} className={'py-0 text-mono-100'}>
                  {(label as NativeLabel).nativeValue} USD
                </Typography>
              ) : (
                <Typography variant={'body4'} fw={'bold'} className='py-0 text-mono-200'>
                  {(label as BridgeLabel).token}{' '}
                  <ExternalLinkLine width={12} height={12} className='!fill-current inline whitespace-nowrap' />
                </Typography>
              )}
            </div>
            <div className={'h-full self-start  flex items-end grow  flex flex-col '}>
              {hasSyncNote && (
                <Button variant={'link'} size={'sm'} onClick={onSyncNote}>
                  SYNC NOTE
                </Button>
              )}

              <div className='flex items-center mt-1'>
                <div className={`w-5  h-5 rounded-full flex items-center justify-center`} children={wallets.src} />
                <div className='px-2'>
                  <ArrowRight />
                </div>
                <div className={`w-5  h-5 rounded-full flex items-center justify-center`} children={wallets.dist} />
              </div>
            </div>
          </div>
        </div>

        {/*Card Info or Disclaimer*/}
        {hasSyncNote && (
          <div className={sectionPadding}>
            <Disclaimer
              variant={'info'}
              message={'New spend note is added to your account to reflect updated balance on Webb.'}
            />
          </div>
        )}
        {/*Card Footer*/}
        <div className='flex flex-col relative z-1'>
          <TransactionCardFooter {...props.footer} onDismiss={onDismiss} onDetails={onDetails} />
        </div>
      </div>
    );
  }
);
