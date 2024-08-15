import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useCallback, useMemo, useState } from 'react';

import {
  type CancelDelegatorUnstakeRequestContext,
  type ExecuteAllDelegatorUnstakeRequestContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import { isScheduledRequestReady } from '../utils';
import type { UnstakeRequestTableData } from './types';

type Props = {
  allRequests: UnstakeRequestTableData[];
  selectedRequests: UnstakeRequestTableData[];
};

const UnstakeRequestTableActions = ({
  allRequests,
  selectedRequests,
}: Props) => {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const cancelOptions =
    useRestakeTxEventHandlersWithNoti<CancelDelegatorUnstakeRequestContext>(
      useMemo(
        () =>
          ({
            options: {
              [TxEvent.SUCCESS]: {
                message: 'Successfully canceled unstake request!',
              },
            },
          }) satisfies Parameters<typeof useRestakeTxEventHandlersWithNoti>[0],
        [],
      ),
    );

  const executeOptions =
    useRestakeTxEventHandlersWithNoti<ExecuteAllDelegatorUnstakeRequestContext>(
      useMemo(
        () =>
          ({
            options: {
              [TxEvent.SUCCESS]: {
                message: 'Successfully executed unstake request!',
              },
            },
          }) satisfies Parameters<typeof useRestakeTxEventHandlersWithNoti>[0],
        [],
      ),
    );

  const { executeDelegatorUnstakeRequests, cancelDelegatorUnstakeRequests } =
    useRestakeTx();

  const handleCancelUnstake = useCallback(async () => {
    setIsCanceling(true);

    const unstakeRequests = selectedRequests.map(
      ({ amountRaw, operatorAccountId, assetId }) => {
        return {
          amount: amountRaw,
          assetId,
          operatorAccount: operatorAccountId,
        } satisfies CancelDelegatorUnstakeRequestContext['unstakeRequests'][number];
      },
    );

    await cancelDelegatorUnstakeRequests(unstakeRequests, cancelOptions);

    setIsCanceling(false);
  }, [cancelDelegatorUnstakeRequests, cancelOptions, selectedRequests]);

  const handleExecuteUnstake = useCallback(async () => {
    setIsExecuting(true);
    await executeDelegatorUnstakeRequests(executeOptions);
    setIsExecuting(false);
  }, [executeDelegatorUnstakeRequests, executeOptions]);

  const canCancelUnstake = useMemo(
    () => selectedRequests.length > 0,
    [selectedRequests.length],
  );

  const canExecuteUnstake = useMemo(() => {
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
        isDisabled={!canCancelUnstake || isExecuting}
        isFullWidth
        onClick={handleCancelUnstake}
        variant="secondary"
      >
        Cancel Unstake
      </Button>

      <Button
        className="flex-1"
        isLoading={isExecuting}
        loadingText="Executing..."
        isDisabled={!canExecuteUnstake || isCanceling}
        isFullWidth
        onClick={handleExecuteUnstake}
      >
        Execute All
      </Button>
    </>
  );
};

export default UnstakeRequestTableActions;
