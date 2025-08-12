import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useEffect } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { WithdrawRequestTableRow } from './WithdrawRequestTable';
import { BN } from '@polkadot/util';
import useRestakeWithdrawExecuteTx from '../../data/restake/useRestakeWithdrawExecuteTx';
import useRestakeWithdrawCancelTx from '../../data/restake/useRestakeWithdrawCancelTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';

type Props = {
  allRequests: WithdrawRequestTableRow[];
  selectedRequests: WithdrawRequestTableRow[];
  onExecuted: () => void;
};

const WithdrawRequestTableActions: FC<Props> = ({
  allRequests,
  selectedRequests,
  onExecuted,
}) => {
  const { execute: executeWithdraw, status: executeStatus } =
    useRestakeWithdrawExecuteTx();
  const { execute: cancelWithdraw, status: cancelStatus } =
    useRestakeWithdrawCancelTx();

  const isExecuting = executeStatus === TxStatus.PROCESSING;
  const isCancelling = cancelStatus === TxStatus.PROCESSING;
  const isTransacting = isExecuting || isCancelling;
  const isReady =
    executeWithdraw !== null && cancelWithdraw !== null && !isTransacting;

  useEffect(() => {
    if (executeStatus === TxStatus.COMPLETE && onExecuted) {
      onExecuted();
    }
  }, [executeStatus, onExecuted]);

  const handleCancelWithdraw = useCallback(async () => {
    if (!isReady || cancelWithdraw === null) {
      return;
    }

    const requests = selectedRequests.map(({ amountRaw, assetId }) => {
      return {
        amount: new BN(amountRaw.toString()),
        assetId,
      };
    });

    await cancelWithdraw(requests);
  }, [isReady, selectedRequests, cancelWithdraw]);

  const handleExecuteWithdraw = useCallback(async () => {
    if (!isReady || executeWithdraw === null) {
      return;
    }

    await executeWithdraw();
  }, [isReady, executeWithdraw]);

  const canCancelWithdraw = selectedRequests.length > 0;

  const canExecuteWithdraw = useMemo(() => {
    if (allRequests.length === 0) {
      return false;
    }

    return allRequests.some(({ sessionsRemaining }) => {
      return isScheduledRequestReady(sessionsRemaining);
    });
  }, [allRequests]);

  return (
    <div className="flex items-center gap-3">
      <Button
        className="flex-1"
        isLoading={isCancelling}
        isDisabled={!canCancelWithdraw || !isReady}
        isFullWidth
        onClick={handleCancelWithdraw}
        variant="secondary"
      >
        Cancel Withdraw
      </Button>

      <Button
        className="flex-1"
        isLoading={isExecuting}
        isDisabled={!canExecuteWithdraw || canCancelWithdraw || !isReady}
        isFullWidth
        onClick={handleExecuteWithdraw}
      >
        Execute All
      </Button>
    </div>
  );
};

export default WithdrawRequestTableActions;
