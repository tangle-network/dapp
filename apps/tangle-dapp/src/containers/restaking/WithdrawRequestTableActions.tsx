import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useCallback, useMemo } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { WithdrawRequestTableRow } from './WithdrawRequestTable';
import useRestakeExecuteWithdrawRequestsTx from '../../data/restake/useRestakeExecuteWithdrawRequestsTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useRestakeCancelWithdrawRequestsTx from '../../data/restake/useRestakeCancelWithdrawRequestsTx';
import { BN } from '@polkadot/util';

type Props = {
  allRequests: WithdrawRequestTableRow[];
  selectedRequests: WithdrawRequestTableRow[];
};

const WithdrawRequestTableActions: FC<Props> = ({
  allRequests,
  selectedRequests,
}) => {
  const { execute: executeWithdraw, status: withdrawStatus } =
    useRestakeExecuteWithdrawRequestsTx();

  const { execute: executeCancel, status: cancelStatus } =
    useRestakeCancelWithdrawRequestsTx();

  const isReadyToWithdraw =
    executeWithdraw !== null && withdrawStatus !== TxStatus.PROCESSING;

  const isReadyToCancel =
    executeCancel !== null && cancelStatus !== TxStatus.PROCESSING;

  const handleCancelWithdraw = useCallback(async () => {
    if (!isReadyToCancel) {
      return;
    }

    const requests = selectedRequests.map(({ amountRaw, assetId }) => {
      return {
        amount: new BN(amountRaw.toString()),
        assetId,
      };
    });

    return executeCancel({
      withdrawRequests: requests,
    });
  }, [isReadyToCancel, selectedRequests, executeCancel]);

  const handleExecuteWithdraw = useCallback(() => {
    if (!isReadyToWithdraw) {
      return;
    }

    return executeWithdraw();
  }, [isReadyToWithdraw, executeWithdraw]);

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
        isLoading={cancelStatus === TxStatus.PROCESSING}
        isDisabled={!canCancelWithdraw || !isReadyToCancel}
        isFullWidth
        onClick={handleCancelWithdraw}
        variant="secondary"
      >
        Cancel Withdraw
      </Button>

      <Button
        className="flex-1"
        isLoading={withdrawStatus === TxStatus.PROCESSING}
        isDisabled={!canExecuteWithdraw || !isReadyToWithdraw}
        isFullWidth
        onClick={handleExecuteWithdraw}
      >
        Execute All
      </Button>
    </div>
  );
};

export default WithdrawRequestTableActions;
