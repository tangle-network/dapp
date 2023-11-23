import {
  AlertFill,
  ChevronUp,
  ExternalLinkLine,
  PartyFill,
  Spinner,
  TokenIcon,
} from '@webb-tools/icons';
import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

import { IconWithTooltip } from '../../components/IconWithTooltip';
import { TokenPairIcons } from '../../components/TokenPairIcons';
import { Typography } from '../../typography';
import { shortenHex } from '../../utils';
import { TransactionProgressCard } from './TransactionProgressCard';
import {
  TransactionCardItemProps,
  TransactionItemVariant,
  TransactionQueueProps,
} from './types';

const CompletedFooter: FC<{ method: TransactionItemVariant }> = ({
  method,
}) => {
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
      <span className={'inline-block pr-2'}>
        <PartyFill maxWidth={18} />
      </span>
      <span className={'text-inherit dark:text-inherit'}>{message}</span>
    </>
  );
};

const FailedFooter = () => {
  return (
    <>
      <span className={'inline-block pr-2'}>
        <AlertFill size="md" />
      </span>
      <span className={'text-inherit dark:text-inherit'}>
        Transaction failed &nbsp;
      </span>
    </>
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
export const TransactionQueueCard = forwardRef<
  HTMLDivElement,
  TransactionQueueProps
>(
  (
    {
      collapsed: collapsedParent,
      className,
      transactions,
      onCollapseChange,
      ...props
    },
    ref
  ) => {
    const controlled = useMemo(
      () => typeof collapsedParent === 'boolean',
      [collapsedParent]
    );

    const [collapsed, setCollapsed] = useState(
      controlled ? collapsedParent : false
    );

    // Sync the state of open to the parent component
    useEffect(() => {
      if (controlled) {
        setCollapsed(collapsedParent);
      }
    }, [controlled, collapsedParent]);

    // if the component is controlled change the parent state
    const handleCollapsed = useCallback(() => {
      if (onCollapseChange) {
        onCollapseChange?.(!collapsed);
      }
      setCollapsed(!collapsed);
    }, [onCollapseChange, setCollapsed, collapsed]);

    const txCardProps = useMemo(() => {
      return transactions.map(
        (tx): TransactionCardItemProps & { id: string } => {
          const isLoading = tx.txStatus.status === 'in-progress';
          const isErrored = tx.txStatus.status === 'warning';
          const isCompleted = tx.txStatus.status === 'completed';
          const recipientFooter = tx.txStatus.recipient ? (
            <>
              Recipient: {shortenHex(tx.txStatus.recipient)}{' '}
              <ExternalLinkLine
                width={12}
                height={12}
                className="!fill-current inline whitespace-nowrap"
              />
            </>
          ) : (
            ''
          );
          const txURI =
            tx.getExplorerURI?.(tx.txStatus.txHash ?? '', 'tx') ?? '#';
          const recipientURI =
            tx.getExplorerURI?.(tx.txStatus.recipient ?? '', 'address') ?? '#';

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
                ? { uri: txURI, text: <FailedFooter /> }
                : tx.txStatus.message
                ? undefined
                : { uri: recipientURI, text: recipientFooter },
              message: isErrored ? <FailedFooter /> : tx.txStatus.message,
            },
            label: {
              amount: tx.amount,
              token: tx.token,
              tokenURI: tx.tokenURI ?? '#',
              nativeValue: tx.nativeValue,
            },
            tokens:
              tx.tokens.length === 1 ? (
                <IconWithTooltip
                  icon={<TokenIcon name={tx.tokens[0]} />}
                  content={tx.tokens[0]}
                />
              ) : (
                <TokenPairIcons
                  token1Symbol={tx.tokens[0]}
                  token2Symbol={tx.tokens[1]}
                />
              ),

            onDismiss: tx.onDismiss,
            onSyncNote: tx.onSyncNote,
            onDetails: tx.onDetails,
          };
        }
      );
    }, [transactions]);

    const transactionsCountSummery = useMemo(() => {
      const processingCount = transactions.filter(
        (tx) => tx.txStatus.status === 'in-progress'
      ).length;
      const failedCount = transactions.filter(
        (tx) => tx.txStatus.status === 'warning'
      ).length;
      const completedCount = transactions.filter(
        (tx) => tx.txStatus.status === 'completed'
      ).length;

      return {
        processingCount,
        failedCount,
        completedCount,
      };
    }, [transactions]);

    const transactionsSummeryIcon = useMemo(() => {
      const { completedCount, failedCount, processingCount } =
        transactionsCountSummery;
      if (failedCount > 0) {
        return <AlertFill size="md" />;
      }
      if (processingCount > 0) {
        return <Spinner width={18} />;
      }
      if (completedCount > 0) {
        return <PartyFill maxWidth={18} />;
      }
    }, [transactionsCountSummery]);

    const transactionSummeryText = useMemo(() => {
      const { completedCount, failedCount, processingCount } =
        transactionsCountSummery;
      const messages: string[] = [];

      if (processingCount) {
        messages.push(
          `${processingCount} transaction${
            processingCount > 1 ? 's' : ''
          } in progress`
        );
      }

      if (failedCount) {
        messages.push(
          `${failedCount} transaction${failedCount > 1 ? 's' : ''} failed`
        );
      }

      if (completedCount) {
        messages.push(
          `${completedCount} transaction${
            completedCount > 1 ? 's' : ''
          } completed`
        );
      }

      return messages.join(', ');
    }, [transactionsCountSummery]);

    return (
      <div
        {...props}
        className={twMerge(
          'rounded-lg shadow-xl overflow-hidden',
          'flex flex-col max-w-[295px] bg-mono-0 dark:bg-mono-160',
          className
        )}
        ref={ref}
      >
        <div className="flex items-center p-3 row">
          <div className={'pr-4'}>{transactionsSummeryIcon}</div>

          <div className={'grow'}>
            <Typography
              variant={'h5'}
              fw={'bold'}
              className={' text-mono-180 dark:text-mono'}
            >
              {txCardProps.length > 0 &&
                (txCardProps[0].status === 'completed'
                  ? 'Transaction Completed'
                  : txCardProps[0].status === 'warning'
                  ? 'Transaction Failed'
                  : 'Transaction Processing')}
            </Typography>
            <Typography
              variant={'body1'}
              className={'text-mono-120 dark:text-mono-80 pr-1'}
            >
              {transactionSummeryText}
            </Typography>
          </div>
          <b>
            <div
              style={{
                transition: 'transform .33s ease',
                transform: !collapsed ? 'rotate(180deg)' : 'rotate(0)',
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
          {!collapsed && (
            <>
              {txCardProps.map(({ id, ...props }) => (
                <TransactionProgressCard key={id} {...props} />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
);
