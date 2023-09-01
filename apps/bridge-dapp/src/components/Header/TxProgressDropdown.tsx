import {
  DropdownMenuTrigger as DropdownTrigger,
  DropdownMenuPortal as DropdownPortal,
} from '@radix-ui/react-dropdown-menu';
import {
  getExplorerURI,
  getTxMessageFromStatus,
  transactionItemStatusFromTxStatus,
} from '@webb-tools/api-provider-environment/transaction';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import TxProgressor from '@webb-tools/webb-ui-components/components/TxProgressor';
import { TxInfo } from '@webb-tools/webb-ui-components/components/TxProgressor/types';
import LoadingPill from '@webb-tools/webb-ui-components/components/buttons/LoadingPill';
import { ComponentProps, useEffect, useMemo, useState } from 'react';

const TxProgressDropdown = () => {
  const { activeApi, apiConfig } = useWebContext();

  const {
    txQueue: { txQueue, api, currentTxId },
  } = useWebContext();

  const [pillStatus, setPillStatus] =
    useState<ComponentProps<typeof LoadingPill>['status']>('loading');

  // Sort the latest tx to the top
  const sortedTxQueue = useMemo(
    () =>
      txQueue
        .slice()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [txQueue]
  );

  const currentTx = useMemo(() => {
    if (typeof currentTxId === 'string') {
      return sortedTxQueue.find((tx) => tx.id === currentTxId);
    }

    // Get the latest tx
    return sortedTxQueue[0];
  }, [currentTxId, sortedTxQueue]);

  useEffect(() => {
    if (!currentTx) {
      return;
    }

    const sub = currentTx.$currentStatus.subscribe(([state]) => {
      const status = transactionItemStatusFromTxStatus(state);

      setPillStatus(
        status === 'completed'
          ? 'success'
          : status === 'warning'
          ? 'error'
          : 'loading'
      );
    });

    return () => {
      sub.unsubscribe();
    };
  }, [currentTx]);

  if (!txQueue.length) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <LoadingPill status={pillStatus} />
      </DropdownTrigger>

      <DropdownPortal>
        <DropdownBody className="mt-4 max-h-80 w-[32rem] overflow-scroll overflow-x-hidden">
          {sortedTxQueue.map((tx) => {
            let srcAccountType: TxInfo['accountType'] | undefined = undefined;
            let destAccountType: TxInfo['accountType'] | undefined = undefined;

            let srcTokenType: TxInfo['tokenType'] | undefined = undefined;
            let destTokenType: TxInfo['tokenType'] | undefined = undefined;

            if (tx.name === 'Deposit') {
              srcAccountType = 'wallet';
              destAccountType = 'note';

              srcTokenType = 'unshielded';
              destTokenType = 'shielded';
            } else if (tx.name === 'Transfer') {
              srcAccountType = 'note';
              destAccountType = 'note';

              srcTokenType = 'shielded';
              destTokenType = 'shielded';
            } else if (tx.name === 'Withdraw') {
              srcAccountType = 'note';
              destAccountType = 'wallet';

              srcTokenType = 'shielded';
              destTokenType = 'unshielded';
            }

            const blockExplorer =
              apiConfig.chains[tx.metaData.wallets.src].blockExplorers?.default
                ?.url;
            const providerType = activeApi?.type;

            const status = transactionItemStatusFromTxStatus(
              tx.currentStatus[0]
            );
            const completedTxUrl =
              status === 'completed' &&
              blockExplorer &&
              providerType &&
              tx.txHash
                ? getExplorerURI(blockExplorer, tx.txHash, 'tx', providerType)
                : undefined;

            const btnProps = {
              onClick: () => {
                api.dismissTransaction(tx.id);
              },
              children: 'Dismiss',
            };

            return (
              <TxProgressor.Root key={tx.id}>
                <TxProgressor.Header name={tx.name} createdAt={tx.timestamp} />
                <TxProgressor.Body
                  txSourceInfo={{
                    isSource: true,
                    typedChainId: tx.metaData.wallets.src,
                    amount: tx.metaData.amount * -1,
                    tokenSymbol: tx.metaData.tokens[0],
                    walletAddress: tx.metaData.address,
                    accountType: srcAccountType,
                    tokenType: srcTokenType,
                  }}
                  txDestinationInfo={{
                    typedChainId: tx.metaData.wallets.dest,
                    amount: tx.metaData.amount,
                    tokenSymbol: tx.metaData.tokens[1],
                    walletAddress: tx.metaData.recipient,
                    accountType: destAccountType,
                    tokenType: destTokenType,
                  }}
                />
                <TxProgressor.Footer
                  status={
                    status === 'warning'
                      ? 'error'
                      : status === 'completed'
                      ? 'success'
                      : 'info'
                  }
                  statusMessage={getTxMessageFromStatus(
                    tx.currentStatus[0],
                    tx.currentStatus[1]
                  )}
                  actionProps={btnProps}
                  externalUrl={completedTxUrl}
                  steppedProgressProps={{
                    steps: tx.totalSteps,
                    activeStep: tx.stepSubject.getValue(),
                  }}
                />
              </TxProgressor.Root>
            );
          })}
        </DropdownBody>
      </DropdownPortal>
    </Dropdown>
  );
};

export default TxProgressDropdown;
