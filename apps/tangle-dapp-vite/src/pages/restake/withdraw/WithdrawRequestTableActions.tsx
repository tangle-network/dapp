import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useCallback, useMemo, useState } from 'react';

import {
  type CancelWithdrawRequestContext,
  type ExecuteAllWithdrawRequestContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import { isScheduledRequestReady } from '../utils';
import type { WithdrawRequestTableData } from './types';

type Props = {
  allRequests: WithdrawRequestTableData[];
  selectedRequests: WithdrawRequestTableData[];
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

  const canCancelWithdraw = useMemo(
    () => selectedRequests.length > 0,
    [selectedRequests.length],
  );

  const canExecuteWithdraw = useMemo(() => {
    if (allRequests.length === 0) return false;

    return allRequests.some(({ timeRemaining }) => {
      return isScheduledRequestReady(timeRemaining);
    });
  }, [allRequests]);

  return (
    <>
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
    </>
  );
};

export default WithdrawRequestTableActions;
