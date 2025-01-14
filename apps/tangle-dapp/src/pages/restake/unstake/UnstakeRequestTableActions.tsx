import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useState } from 'react';
import { TxEvent } from '@webb-tools/abstract-api-provider';
import {
  type CancelDelegatorUnstakeRequestContext,
  type ExecuteAllDelegatorUnstakeRequestContext,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import { isScheduledRequestReady } from '../utils';
import { UnstakeRequestTableRow } from './UnstakeRequestTable';

type Props = {
  allRequests: UnstakeRequestTableRow[];
  selectedRequests: UnstakeRequestTableRow[];
};

const UnstakeRequestTableActions: FC<Props> = ({
  allRequests,
  selectedRequests,
}) => {
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

  const canCancelUnstake = selectedRequests.length > 0;

  const canExecuteUnstake = useMemo(() => {
    if (allRequests.length === 0) {
      return false;
    }

    return allRequests.some(({ sessionsRemaining: timeRemaining }) =>
      isScheduledRequestReady(timeRemaining),
    );
  }, [allRequests]);

  return (
    <>
      <Button
        isLoading={isCanceling}
        isDisabled={!canCancelUnstake || isExecuting}
        isFullWidth
        onClick={handleCancelUnstake}
        variant="secondary"
      >
        Cancel Unstake
      </Button>

      <Button
        isLoading={isExecuting}
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
