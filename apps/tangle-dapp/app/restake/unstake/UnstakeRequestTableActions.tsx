import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useCallback, useMemo, useState } from 'react';

import {
  type CancelDelegatorUnstakeRequestContext,
  type ExecuteDelegatorBondLessContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import type { UnstakeRequestTableData } from './types';
import { isUnstakeRequestReady } from './utils';

type Props = {
  selectedRequests: UnstakeRequestTableData[];
};

const UnstakeRequestTableActions = ({ selectedRequests }: Props) => {
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
    useRestakeTxEventHandlersWithNoti<ExecuteDelegatorBondLessContext>(
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
    if (selectedRequests.length === 0) return false;

    return selectedRequests.every(({ timeRemaining }) => {
      return isUnstakeRequestReady(timeRemaining);
    });
  }, [selectedRequests]);

  return (
    <>
      <Button
        className="flex-1"
        isLoading={isCanceling}
        loadingText="Canceling..."
        isDisabled={!canCancelUnstake}
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
        isDisabled={!canExecuteUnstake}
        isFullWidth
        onClick={handleExecuteUnstake}
      >
        Execute Unstake
      </Button>
    </>
  );
};

export default UnstakeRequestTableActions;
