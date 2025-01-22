import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useState } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { UnstakeRequestTableRow } from './UnstakeRequestTable';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../data/restake/useRestakeApi';

type Props = {
  allRequests: UnstakeRequestTableRow[];
  selectedRequests: UnstakeRequestTableRow[];
};

const UnstakeRequestTableActions: FC<Props> = ({
  allRequests,
  selectedRequests,
}) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const restakeApi = useRestakeApi();

  const isReady = restakeApi !== null && !isTransacting;

  const handleCancelUnstake = useCallback(async () => {
    if (!isReady) {
      return;
    }

    const unstakeRequests = selectedRequests.map(
      ({ amountRaw, operatorAccountId, assetId }) => {
        return {
          amount: new BN(amountRaw.toString()),
          assetId,
          operatorAddress: operatorAccountId,
        };
      },
    );

    setIsTransacting(true);

    const result = await restakeApi.cancelUndelegate(unstakeRequests);

    setIsTransacting(false);

    return result;
  }, [isReady, restakeApi, selectedRequests]);

  const handleExecuteUnstake = useCallback(async () => {
    if (!isReady) {
      return;
    }

    setIsTransacting(true);

    const result = await restakeApi.executeUndelegate();

    setIsTransacting(false);

    return result;
  }, [isReady, restakeApi]);

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
        isLoading={isTransacting}
        isDisabled={!isReady || !canCancelUnstake}
        isFullWidth
        onClick={handleCancelUnstake}
        variant="secondary"
      >
        Cancel Unstake
      </Button>

      <Button
        isLoading={isTransacting}
        isDisabled={!isReady || !canExecuteUnstake}
        isFullWidth
        onClick={handleExecuteUnstake}
      >
        Execute All
      </Button>
    </div>
  );
};

export default UnstakeRequestTableActions;
