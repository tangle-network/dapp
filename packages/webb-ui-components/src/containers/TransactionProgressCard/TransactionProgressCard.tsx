import { Button, Chip } from '@webb-dapp/webb-ui-components';
import { Disclaimer } from '@webb-dapp/webb-ui-components/components/Disclaimer/Disclaimer';
import {
  Alert,
  ArrowRight,
  ChevronUp,
  ExternalLinkLine,
  Spinner,
  TokenIcon,
} from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { FC, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  BridgeLabel,
  NativeLabel,
  TransactionCardItemProps,
  TransactionItemVariant,
  TransactionPayload,
  TransactionProgressCardProps,
  TXCardFooterProps,
} from './types';
import { ChipColors } from '@webb-dapp/webb-ui-components/components/Chip/types';
import PolygonLogo from '@webb-dapp/apps/configs/logos/chains/PolygonLogo';
import { EthLogo } from '@webb-dapp/apps/configs/logos/chains';
import { shortenHex } from '@webb-dapp/webb-ui-components/utils';
import cx from 'classnames';
import { AlertFill } from '@webb-dapp/webb-ui-components/icons/AlertFill';
import { PartyFill } from '@webb-dapp/webb-ui-components/icons/PartyFill';

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
  ({ className, label, tokens, onSyncNote, method, wallets, onDismiss, onDetails, ...props }, ref) => {
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
            flex flex-col  dark:bg-mono-160`,
          className
        )}
        {...props}
        ref={ref}
      >
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
        <TXCardFooter {...props.footer} onDismiss={onDismiss} onDetails={onDetails} />
      </div>
    );
  }
);
const CompletedFooter: FC<{ method: TransactionItemVariant }> = ({ method }) => {
  const message = useMemo(() => {
    switch (method) {
      case 'Transfer':
        return 'Successfully Transferred!';
      case 'Deposit':
        return 'Successfully Deposited!';
      case 'Withdraw':
        return 'Successfully Withdrawn!';
    }
  }, [method]);
  return (
    <>
      <div className={'pr-2'}>
        <PartyFill maxWidth={18} />
      </div>
      <span className={'text-inherit dark:text-inherit'}>{message}</span>
    </>
  );
};

const FailedFooter: FC<{ uri: string; method: TransactionItemVariant }> = ({ uri, method }) => {
  const message = useMemo(() => {
    switch (method) {
      case 'Transfer':
        return 'Failed to  transfer!';
      case 'Deposit':
        return 'Failed to deposit';
      case 'Withdraw':
        return 'Failed to withdraw';
    }
  }, [method]);
  return (
    <>
      <span className={'inline-block pr-2'}>
        <AlertFill maxWidth={16} />
      </span>
      <span className={'text-inherit dark:text-inherit'}>{message} &nbsp;</span>
      <ExternalLinkLine
        width={12}
        height={12}
        className='text-inherit dark:text-inherit !fill-current inline whitespace-nowrap'
      />
    </>
  );
};

/**
 *  Transaction card footer
 *  @description An internal component that is used for the `TransactionProcessingCard`
 *
 *  @example Footer for success Transfer Transaction
 *  ```jsx
 *  <TxCardFooter
 *   isLoading={false}
 *   message={ (
              <>
                <span className={'inline-block pr-2'}>🎉</span>Successfully Transfer!
              </>
            )}
 onDetails={() =>{
        window.open(...)
      }
 *  />
 *  ```
 *  @example Footer for failed transaction
 *  <TxCardFooter
 *    hasWarning
 *    link= {{
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
            }}
 />
 *
 * */
const TXCardFooter: FC<TXCardFooterProps & Pick<TransactionCardItemProps, 'onDismiss' | 'onDetails'>> = ({
  isLoading,
  message,
  link,
  hasWarning,
  onDetails,
  onDismiss,
}) => {
  const textClass = cx(
    'py-0 align-middle',
    { 'text-yellow-100 dark:text-yellow-50': hasWarning },
    { 'text-mono-100': !hasWarning }
  );

  const showDetails = Boolean(onDetails) && isLoading;
  const buttonHandler = useCallback(() => {
    return showDetails ? onDetails?.() : onDismiss();
  }, [showDetails]);
  return (
    <div
      className={cx('my-0 flex items-center p-4', {
        'bg-yellow-10 border-t-2 border-yellow-90 dark:bg-yellow-120': hasWarning,
      })}
    >
      <div className='flex items-center'>
        {isLoading && !hasWarning && (
          <div className='pr-2'>
            <Spinner />
          </div>
        )}

        {message && !link && (
          <Typography variant={'body4'} fw={'bold'} className={twMerge(textClass, 'flex items-center')}>
            {message}
          </Typography>
        )}
        {link && (
          <Typography variant={'body4'} fw={'bold'} className={twMerge(textClass, 'flex items-center')}>
            {link.text}
          </Typography>
        )}
      </div>
      <div className={'flex grow justify-end'}>
        <Button onClick={buttonHandler} variant={'link'} size={'sm'} className={hasWarning ? textClass : undefined}>
          {showDetails ? 'DETAILS' : 'DISMISS'}
        </Button>
      </div>
    </div>
  );
};

/**
 * Transaction Queue
 * @description The wrapper component for the transaction processing card
 *
 * @example
 *
 * ```jsx
 *  <TransactionQueue  collapsed={collapsed} onCollapseChange={c => setCollapsed(c)}
 *   transactions={transactionsList}
 *  />
 * ```
 *
 * */
export const TransactionQueue: FC<TransactionProgressCardProps> = ({
  collapsed,
  transactions,
  onCollapseChange,
  children,
}) => {
  const [open, setOpen] = useState(!collapsed);
  // Sync the state of open to the parent component
  useEffect(() => {
    if (collapsed !== open) {
      return;
    }
    setOpen(collapsed);
  }, [collapsed]);

  // if the component is controlled change the parent state
  const handleCollapsed = useCallback(() => {
    if (onCollapseChange) {
      onCollapseChange?.(!open);
    } else {
      setOpen(!open);
    }
  }, [onCollapseChange, setOpen, open]);

  const txCardProps = useMemo(() => {
    return transactions.map((tx): TransactionCardItemProps & { id: string } => {
      const isLoading = tx.txStatus.status === 'in-progress';
      const isErrored = tx.txStatus.status === 'warning';
      const isCompleted = tx.txStatus.status === 'completed';
      const recipientFooter = tx.txStatus.recipient ? (
        <>
          Recipient: {shortenHex(tx.txStatus.recipient)}{' '}
          <ExternalLinkLine width={12} height={12} className='!fill-current inline whitespace-nowrap' />
        </>
      ) : (
        ''
      );
      const txURI = tx.getExplorerURI?.(tx.txStatus.THash ?? '', 'tx') ?? '#';
      const recipientURI = tx.getExplorerURI?.(tx.txStatus.recipient ?? '', 'address') ?? '#';
      return {
        id: tx.id,
        method: tx.method,
        wallets: tx.wallets,
        firedAt: tx.timestamp,
        status: tx.txStatus.status,
        footer: {
          isLoading,
          hasWarning: isErrored,
          link: isCompleted
            ? { uri: txURI, text: <CompletedFooter method={tx.method} /> }
            : isErrored
            ? { uri: txURI, text: <FailedFooter uri={txURI} method={tx.method} /> }
            : tx.txStatus.message
            ? undefined
            : { uri: recipientURI, text: recipientFooter },
          message: tx.txStatus.message,
        },
        label: {
          amount: tx.amount,
          token: tx.token,
          tokenURI: '#',
          nativeValue: tx.nativeValue,
        },
        tokens: tx.tokens.map((t) => <TokenIcon key={`${tx.id}-${t}-${tx.method}`} size={'lg'} name={t} />),

        onDismiss: tx.onDismiss,
        onSyncNote: tx.onSyncNote,
        onDetails: tx.onDetails,
      };
    });
  }, [transactions]);

  const transactionsCountSummery = useMemo(() => {
    const processingCount = transactions.filter((tx) => tx.txStatus.status === 'in-progress').length;
    const failedCount = transactions.filter((tx) => tx.txStatus.status === 'warning').length;
    const completedCount = transactions.filter((tx) => tx.txStatus.status === 'completed').length;

    return {
      processingCount,
      failedCount,
      completedCount,
    };
  }, [transactions]);

  const transactionsSummeryIcon = useMemo(() => {
    const { completedCount, failedCount, processingCount } = transactionsCountSummery;
    if (failedCount > 0) {
      return <AlertFill maxWidth={18} />;
    }
    if (processingCount > 0) {
      return <Spinner width={18} />;
    }
    if (completedCount > 0) {
      return <PartyFill maxWidth={18} />;
    }
  }, [transactionsCountSummery]);
  const transactionSummeryText = useMemo(() => {
    const { completedCount, failedCount, processingCount } = transactionsCountSummery;
    let message = '';
    if (processingCount) {
      message = message + `${processingCount} transaction${processingCount > 1 ? 's' : ''} in progress`;
    }

    if (failedCount) {
      message = message + ` ,${failedCount} transaction${failedCount > 1 ? 's' : ''} failed`;
    }

    if (completedCount) {
      message = message + ` ,${completedCount} transaction${completedCount > 1 ? 's' : ''} completed`;
    }
    return message;
  }, [transactionsCountSummery]);

  return (
    <div
      className={`rounded-lg shadow-xl  overflow-hidden
            flex flex-col  max-w-[295px] dark:bg-mono-160`}
    >
      <div className='flex row items-center    p-3'>
        <div className={'pr-4'}>{transactionsSummeryIcon}</div>

        <div className={'grow'}>
          <Typography variant={'body2'} fw={'bold'} className={' text-mono-180 dark:text-mono'}>
            Transaction Processing
          </Typography>
          <Typography variant={'body4'} className={'text-mono-120 dark:text-mono-80 pr-1'}>
            {transactionSummeryText}
          </Typography>
        </div>
        <b>
          <div
            style={{
              transition: 'transform .33s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
            }}
            role={'button'}
            className={'w-4 h-4'}
            onClick={handleCollapsed}
          >
            <ChevronUp />
          </div>
        </b>
      </div>
      <div className={'max-h-96 overflow-auto'}>
        {open && (
          <>
            {txCardProps.map(({ id, ...props }) => (
              <TransactionProgressCard key={id} {...props} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export const dummyTransactions: TransactionPayload[] = [
  {
    method: 'Withdraw',
    txStatus: {
      status: 'in-progress',
      message: 'Generating ZK  proofs..',
      recipient: '0xasdfj2r3092430u',
      THash: '0xasdfj2r3092430u',
    },
    tokens: ['USDC', 'ETH'],
    token: 'ETH',
    amount: '0.999',
    id: '123f',
    wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
    timestamp: new Date(),
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
      return '#';
    },
    nativeValue: '1230',
    onDetails: () => {},
    onDismiss: () => {},
    onSyncNote: () => {},
  },
  {
    method: 'Withdraw',
    txStatus: {
      status: 'completed',
      recipient: '0xasdfj2r3092430u',
      THash: '0xasdfj2r3092430u',
    },
    tokens: ['USDT', 'ETH'],
    token: 'ETH',
    amount: '0.9995',
    id: '123fA',
    wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
    timestamp: new Date(),
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
      return '#';
    },
    nativeValue: '1230',
    onDetails: () => {},
    onDismiss: () => {},
    onSyncNote: () => {},
  },
  {
    method: 'Withdraw',
    txStatus: {
      status: 'warning',
      message: 'Generating ZK  proofs..',
      recipient: '0xasdfj2r3092430u',
      THash: '0xasdfj2r3092430u',
    },
    tokens: ['ETH'],
    token: 'ETH',
    amount: '0.999',
    id: '123f2',
    wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
    timestamp: new Date(),
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
      return '#';
    },
    nativeValue: '1230',
    onDetails: () => {},
    onDismiss: () => {},
  },
  {
    method: 'Transfer',
    txStatus: {
      status: 'in-progress',
      recipient: '0xasdfj2r3092430u',
      THash: '0xasdfj2r3092430u',
    },
    tokens: ['USDC', 'ETH'],
    token: 'ETH',
    amount: '0.999',
    id: '123f2',
    wallets: { src: <PolygonLogo />, dist: <EthLogo /> },
    timestamp: new Date(),
    getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
      return '#';
    },
    nativeValue: '1230',
    onDetails: () => {},
    onDismiss: () => {},
  },
];
