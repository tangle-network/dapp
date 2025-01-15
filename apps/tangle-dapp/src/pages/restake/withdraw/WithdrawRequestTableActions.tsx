import { TxEvent } from '@webb-tools/abstract-api-provider';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useCallback, useMemo, useState } from 'react';
import {
  type CancelWithdrawRequestContext,
  type ExecuteAllWithdrawRequestContext,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import { isScheduledRequestReady } from '../utils';
import { WithdrawRequestTableRow } from './WithdrawRequestTable';

type Props = {
  allRequests: WithdrawRequestTableRow[];
  selectedRequests: WithdrawRequestTableRow[];
};

const WithdrawRequestTableActions = ({
  allRequests,
  selectedRequests,
}: Props) => {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const cancelOptions =
    useRestakeTxEventHandlersWithNoti<CancelWithdrawRequestContext>(
      useMemo(
        () =>
          ({
            options: {
              [TxEvent.SUCCESS]: {
                message: 'Successfully canceled withdraw request!',
              },
            },
          }) satisfies Parameters<typeof useRestakeTxEventHandlersWithNoti>[0],
        [],
      ),
    );

  const executeOptions =
    useRestakeTxEventHandlersWithNoti<ExecuteAllWithdrawRequestContext>(
      useMemo(
        () =>
          ({
            options: {
              [TxEvent.SUCCESS]: {
                message: 'Successfully executed withdraw request!',
              },
            },
          }) satisfies Parameters<typeof useRestakeTxEventHandlersWithNoti>[0],
        [],
      ),
    );

  const { executeWithdraw, cancelWithdraw } = useRestakeTx();

  const handleCancelWithdraw = useCallback(async () => {
    setIsCanceling(true);

    const requests = selectedRequests.map(({ amountRaw, assetId }) => {
      return {
        amount: amountRaw,
        assetId,
      } satisfies CancelWithdrawRequestContext['withdrawRequests'][number];
    });

    await cancelWithdraw(requests, cancelOptions);

    setIsCanceling(false);
  }, [cancelOptions, cancelWithdraw, selectedRequests]);

  const handleExecuteWithdraw = useCallback(async () => {
    setIsExecuting(true);
    await executeWithdraw(executeOptions);
    setIsExecuting(false);
  }, [executeWithdraw, executeOptions]);

  const canCancelWithdraw = selectedRequests.length > 0;

  const canExecuteWithdraw = useMemo(() => {
    if (allRequests.length === 0) {
      return false;
    }

    return allRequests.some(({ sessionsRemaining: timeRemaining }) => {
      return isScheduledRequestReady(timeRemaining);
    });
  }, [allRequests]);

  return (
    <div className="flex items-center gap-3">
      <Button
        className="flex-1"
        isLoading={isCanceling}
        loadingText="Canceling..."
        isDisabled={!canCancelWithdraw || isExecuting}
        isFullWidth
        onClick={handleCancelWithdraw}
        variant="secondary"
      >
        Cancel Withdraw
      </Button>

      <Button
        className="flex-1"
        isLoading={isExecuting}
        loadingText="Executing..."
        isDisabled={!canExecuteWithdraw || isCanceling}
        isFullWidth
        onClick={handleExecuteWithdraw}
      >
        Execute All
      </Button>
    </div>
  );
};

export default WithdrawRequestTableActions;
