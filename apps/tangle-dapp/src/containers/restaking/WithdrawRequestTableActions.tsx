import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useState } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { WithdrawRequestTableRow } from './WithdrawRequestTable';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../data/restake/useRestakeApi';

type Props = {
  allRequests: WithdrawRequestTableRow[];
  selectedRequests: WithdrawRequestTableRow[];
};

const WithdrawRequestTableActions: FC<Props> = ({
  allRequests,
  selectedRequests,
}) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const restakeApi = useRestakeApi();

  const isReady = restakeApi !== null && !isTransacting;

  const handleCancelWithdraw = useCallback(async () => {
    if (!isReady) {
      return;
    }

    const requests = selectedRequests.map(({ amountRaw, assetId }) => {
      return {
        amount: new BN(amountRaw.toString()),
        assetId,
      };
    });

    setIsTransacting(true);
    await restakeApi.cancelWithdraw(requests);
    setIsTransacting(false);
  }, [isReady, selectedRequests, restakeApi]);

  const handleExecuteWithdraw = useCallback(async () => {
    if (!isReady) {
      return;
    }

    setIsTransacting(true);
    await restakeApi.executeWithdraw();
    setIsTransacting(false);
  }, [isReady, restakeApi]);

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
        isLoading={isTransacting}
        isDisabled={!canCancelWithdraw || !isReady}
        isFullWidth
        onClick={handleCancelWithdraw}
        variant="secondary"
      >
        Cancel Withdraw
      </Button>

      <Button
        className="flex-1"
        isLoading={isTransacting}
        isDisabled={!canExecuteWithdraw || canCancelWithdraw || !isReady}
        isFullWidth
        onClick={handleExecuteWithdraw}
      >
        Execute All
      </Button>
    </div>
  );
};

export default WithdrawRequestTableActions;
