import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  TransactionCardItemProps,
  TransactionItemVariant,
  TransactionQueueProps,
} from './types';
import { TransactionProgressCard } from './TransactionProgressCard';
import { shortenHex, Typography } from '@webb-tools/webb-ui-components';
import {
  ChevronUp,
  ExternalLinkLine,
  Spinner,
  TokenIcon,
  AlertFill,
  PartyFill,
} from '@webb-tools/icons';

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

const FailedFooter: FC<{ uri: string; method: TransactionItemVariant }> = ({
  uri,
  method,
}) => {
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
        className="text-inherit dark:text-inherit !fill-current inline whitespace-nowrap"
      />
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
export const TransactionQueueCard: FC<TransactionQueueProps> = ({
  collapsed: collapsedParent,
  transactions,
  onCollapseChange,
}) => {
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
    } else {
      setCollapsed(!collapsed);
    }
  }, [onCollapseChange, setCollapsed, collapsed, controlled]);

  const txCardProps = useMemo(() => {
    return transactions.map((tx): TransactionCardItemProps & { id: string } => {
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
      const txURI = tx.getExplorerURI?.(tx.txStatus.txHash ?? '', 'tx') ?? '#';
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
            ? {
                uri: txURI,
                text: <FailedFooter uri={txURI} method={tx.method} />,
              }
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
        tokens: tx.tokens.map((t) => (
          <TokenIcon key={`${tx.id}-${t}-${tx.method}`} size={'lg'} name={t} />
        )),

        onDismiss: tx.onDismiss,
        onSyncNote: tx.onSyncNote,
        onDetails: tx.onDetails,
      };
    });
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
    const { completedCount, failedCount, processingCount } =
      transactionsCountSummery;
    let message = '';
    if (processingCount) {
      message =
        message +
        `${processingCount} transaction${
          processingCount > 1 ? 's' : ''
        } in progress`;
    }

    if (failedCount) {
      message =
        message +
        ` ,${failedCount} transaction${failedCount > 1 ? 's' : ''} failed`;
    }

    if (completedCount) {
      message =
        message +
        ` ,${completedCount} transaction${
          completedCount > 1 ? 's' : ''
        } completed`;
    }
    return message;
  }, [transactionsCountSummery]);

  return (
    <div
      className={`rounded-lg shadow-xl  overflow-hidden
            flex flex-col  max-w-[295px] dark:bg-mono-160`}
    >
      <div className="flex row items-center    p-3">
        <div className={'pr-4'}>{transactionsSummeryIcon}</div>

        <div className={'grow'}>
          <Typography
            variant={'body2'}
            fw={'bold'}
            className={' text-mono-180 dark:text-mono'}
          >
            Transaction Processing
          </Typography>
          <Typography
            variant={'body4'}
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
};
