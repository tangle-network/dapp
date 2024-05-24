import type { TransactionExecutor } from '@webb-tools/abstract-api-provider/transaction';
import type { WebbProviderType } from '@webb-tools/abstract-api-provider/types';
import {
  getTxMessageFromStatus,
  transactionItemStatusFromTxStatus,
} from '@webb-tools/api-provider-environment/transaction/useTransactionQueue';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import TxProgressor from '@webb-tools/webb-ui-components/components/TxProgressor';
import type { TxInfo } from '@webb-tools/webb-ui-components/components/TxProgressor/types';
import type { ButtonProps } from '@webb-tools/webb-ui-components/components/buttons/types';
import type { TransactionItemStatus } from '@webb-tools/webb-ui-components/containers/TransactionProgressCard/types';
import type { FC } from 'react';
import { NOTE_ACCOUNT_PATH } from '../../../constants/paths';

const TxItem: FC<{
  tx: TransactionExecutor<unknown>;
  isOnAccountPage?: boolean;
}> = ({ tx, isOnAccountPage }) => {
  const { activeApi, apiConfig, txQueue } = useWebContext();
  const { api } = txQueue;

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
    apiConfig.chains[tx.metaData.wallets.src].blockExplorers?.default?.url;

  const status = transactionItemStatusFromTxStatus(tx.currentStatus[0]);

  const externalUrl = getExternalUrl(blockExplorer, activeApi?.type, tx.txHash);

  const btnProps = isOnAccountPage
    ? ({
        onClick: () => {
          api.dismissTransaction(tx.id);
        },
        children: 'Dismiss',
      } satisfies ButtonProps)
    : ({
        href: `/#/${NOTE_ACCOUNT_PATH}`,
        children: 'View Account',
      } satisfies ButtonProps);

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
        status={getFooterStatus(status)}
        statusMessage={getTxMessageFromStatus(
          tx.currentStatus[0],
          tx.currentStatus[1],
        )}
        actionProps={btnProps}
        externalUrl={externalUrl}
        steppedProgressProps={{
          steps: tx.totalSteps,
          activeStep: tx.stepSubject.getValue(),
        }}
      />
    </TxProgressor.Root>
  );
};

export default TxItem;

const getExternalUrl = (
  explorer?: string,
  provider?: WebbProviderType,
  txHash?: string,
) => {
  if (!txHash) {
    return undefined;
  }

  if (!explorer || !provider) {
    return new URL(`/address/${txHash}`, window.location.origin);
  }

  return getExplorerURI(explorer, txHash, 'tx', provider);
};

const getFooterStatus = (txStatus: TransactionItemStatus) =>
  txStatus === 'completed'
    ? 'success'
    : txStatus === 'warning'
      ? 'error'
      : 'info';
