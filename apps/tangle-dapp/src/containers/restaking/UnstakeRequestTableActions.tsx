import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useState } from 'react';
import { TxEvent } from '@webb-tools/abstract-api-provider';
import {
  type CancelDelegatorUnstakeRequestContext,
  type ExecuteAllDelegatorUnstakeRequestContext,
} from '../../data/restake/RestakeApi/base';
import useRestakeApi from '../../data/restake/useRestakeApi';
import useRestakeTxEventHandlersWithNoti from '../../data/restake/useRestakeTxEventHandlersWithNoti';
import { isScheduledRequestReady } from '../../pages/restake/utils';
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

  const restakeApi = useRestakeApi();

  const handleCancelUnstake = useCallback(async () => {
    if (restakeApi === null) {
      return;
    }

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

    await restakeApi.cancelDelegatorUnstakeRequests(
      unstakeRequests,
      cancelOptions,
    );

    setIsCanceling(false);
  }, [cancelOptions, restakeApi, selectedRequests]);

  const handleExecuteUnstake = useCallback(async () => {
    if (restakeApi === null) {
      return;
    }

    setIsExecuting(true);
    await restakeApi.executeDelegatorUnstakeRequests(executeOptions);
    setIsExecuting(false);
  }, [executeOptions, restakeApi]);

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
    <div className="flex items-center gap-3">
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
    </div>
  );
};

export default UnstakeRequestTableActions;
