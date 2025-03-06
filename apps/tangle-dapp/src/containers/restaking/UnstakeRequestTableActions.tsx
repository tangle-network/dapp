import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useState } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { UnstakeRequestTableRow } from './UnstakeRequestTable';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../data/restake/useRestakeApi';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useNativeRestakeUnstakeExecuteTx from '../../data/restake/useNativeRestakeUnstakeExecuteTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useNativeRestakeUnstakeCancelTx from '../../data/restake/useNativeRestakeUnstakeCancelTx';

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

  const { execute: executeExecute, status: executeStatus } =
    useNativeRestakeUnstakeExecuteTx();

  const { execute: executeCancel, status: cancelStatus } =
    useNativeRestakeUnstakeCancelTx();

  const isReady =
    restakeApi !== null &&
    !isTransacting &&
    executeExecute !== null &&
    executeStatus !== TxStatus.PROCESSING &&
    executeCancel !== null &&
    cancelStatus !== TxStatus.PROCESSING;

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

    const nativeUnstakeRequests = unstakeRequests.filter(
      (request) => request.assetId === NATIVE_ASSET_ID,
    );

    const nonNativeUnstakeRequests = unstakeRequests.filter(
      (request) => request.assetId !== NATIVE_ASSET_ID,
    );

    setIsTransacting(true);

    if (nonNativeUnstakeRequests.length > 0) {
      await restakeApi.cancelUndelegate(nonNativeUnstakeRequests);
    }

    if (nativeUnstakeRequests.length > 0) {
      await executeCancel(
        nativeUnstakeRequests.map((request) => request.operatorAddress),
      );
    }

    setIsTransacting(false);
  }, [executeCancel, isReady, restakeApi, selectedRequests]);

  const handleExecuteUnstake = useCallback(async () => {
    if (!isReady) {
      return;
    }

    setIsTransacting(true);

    const allUnstakeRequests = allRequests.map(
      ({ operatorAccountId, assetId }) => {
        return {
          assetId,
          operatorAddress: operatorAccountId,
        };
      },
    );

    const nativeUnstakeRequests = allUnstakeRequests.filter(
      (request) => request.assetId === NATIVE_ASSET_ID,
    );

    const hasNonNativeUnstakeRequests = allUnstakeRequests.some(
      (request) => request.assetId !== NATIVE_ASSET_ID,
    );

    if (hasNonNativeUnstakeRequests) {
      await restakeApi.executeUndelegate();
    }

    if (nativeUnstakeRequests.length > 0) {
      await executeExecute(
        nativeUnstakeRequests.map((request) => request.operatorAddress),
      );
    }

    setIsTransacting(false);
  }, [allRequests, executeExecute, isReady, restakeApi]);

  const canCancelUnstake = selectedRequests.length > 0;

  const canExecuteUnstake = useMemo(() => {
    if (allRequests.length === 0) {
      return false;
    }

    return allRequests.some(({ sessionsRemaining }) =>
      isScheduledRequestReady(sessionsRemaining),
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
        Cancel Undelegate
      </Button>

      <Button
        isLoading={isTransacting}
        isDisabled={!isReady || canCancelUnstake || !canExecuteUnstake}
        isFullWidth
        onClick={handleExecuteUnstake}
      >
        Execute All
      </Button>
    </div>
  );
};

export default UnstakeRequestTableActions;
