import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useCallback, useMemo } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { UnstakeRequestTableRow } from './UnstakeRequestTable';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useRestakeCancelUnstakeTx from '../../data/restake/useRestakeCancelUnstakeRequestsTx';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import { BN } from '@polkadot/util';
import useRestakeExecuteUnstakeRequestsTx from '../../data/restake/useRestakeExecuteUnstakeRequestsTx';

type Props = {
  allRequests: UnstakeRequestTableRow[];
  selectedRequests: UnstakeRequestTableRow[];
};

const UnstakeRequestTableActions: FC<Props> = ({
  allRequests,
  selectedRequests,
}) => {
  const { execute: executeCancel, status: cancelStatus } =
    useRestakeCancelUnstakeTx();

  const { execute: executeUnstake, status: unstakeStatus } =
    useRestakeExecuteUnstakeRequestsTx();

  const isReadyToCancel =
    executeCancel !== null && cancelStatus !== TxStatus.PROCESSING;

  const isReadyToUnstake =
    executeUnstake !== null && unstakeStatus !== TxStatus.PROCESSING;

  const handleCancelUnstake = useCallback(() => {
    if (!isReadyToCancel) {
      return;
    }

    const unstakeRequests = selectedRequests.map(
      ({ amountRaw, operatorAccountId, assetId }) => {
        return {
          amount: new BN(amountRaw.toString()),
          // TODO: Fix temp force cast.
          assetId: assetId as RestakeAssetId,
          operatorAddress: operatorAccountId,
        };
      },
    );

    return executeCancel({ unstakeRequests });
  }, [executeCancel, isReadyToCancel, selectedRequests]);

  const handleExecuteUnstake = useCallback(() => {
    if (!isReadyToUnstake) {
      return;
    }

    return executeUnstake();
  }, [executeUnstake, isReadyToUnstake]);

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
        isLoading={cancelStatus === TxStatus.PROCESSING}
        isDisabled={!isReadyToCancel || !canCancelUnstake}
        isFullWidth
        onClick={handleCancelUnstake}
        variant="secondary"
      >
        Cancel Unstake
      </Button>

      <Button
        isDisabled={!isReadyToUnstake || !canExecuteUnstake}
        isLoading={unstakeStatus === TxStatus.PROCESSING}
        isFullWidth
        onClick={handleExecuteUnstake}
      >
        Execute All
      </Button>
    </div>
  );
};

export default UnstakeRequestTableActions;
