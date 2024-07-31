import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useCallback, useMemo, useState } from 'react';

import { TxEvent } from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import type { UnstakeRequestTableData } from './types';
import { isUnstakeRequestReady } from './utils';

type Props = {
  selectedRequestIds: string[];
  dataWithId: Record<string, UnstakeRequestTableData>;
};

const UnstakeRequestTableActions = ({
  dataWithId,
  selectedRequestIds,
}: Props) => {
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

  const handleCancelUnstake = useCallback(
    async () => {
      setIsCanceling(true);

      const args = selectedRequestIds.reduce(
        (acc, id) => {
          if (dataWithId[id] === undefined) {
            return acc;
          }

          const data = dataWithId[id];
          acc[data.assetId] = data.amountRaw;
          return acc;
        },
        {} as Record<string, bigint>,
      );
      await cancelDelegatorUnstakeRequests(args, cancelOptions);

      setIsCanceling(false);
    },
    // prettier-ignore
    [cancelDelegatorUnstakeRequests, cancelOptions, dataWithId, selectedRequestIds],
  );

  const handleExecuteUnstake = useCallback(async () => {
    setIsExecuting(true);
    await executeDelegatorUnstakeRequests(executeOptions);
    setIsExecuting(false);
  }, [executeDelegatorUnstakeRequests, executeOptions]);

  const canCancelUnstake = useMemo(
    () => selectedRequestIds.length > 0,
    [selectedRequestIds.length],
  );

  const canExecuteUnstake = useMemo(() => {
    if (selectedRequestIds.length === 0) return false;

    return selectedRequestIds.every((id) => {
      if (!dataWithId[id]) return false;

      const { timeRemaining } = dataWithId[id];
      return isUnstakeRequestReady(timeRemaining);
    });
  }, [dataWithId, selectedRequestIds]);

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
