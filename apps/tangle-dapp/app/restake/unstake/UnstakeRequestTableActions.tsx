import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useCallback, useMemo, useState } from 'react';

import { TxEvent } from '../../../data/restake/RestakeTx/base';
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

  const cancelOptions = useRestakeTxEventHandlersWithNoti(
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

  const executeOptions = useRestakeTxEventHandlersWithNoti(
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

    const args = selectedRequests.reduce(
      (acc, request) => {
        acc[request.assetId] = request.amountRaw;
        return acc;
      },
      {} as Record<string, bigint>,
    );
    await cancelDelegatorUnstakeRequests(args, cancelOptions);

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
