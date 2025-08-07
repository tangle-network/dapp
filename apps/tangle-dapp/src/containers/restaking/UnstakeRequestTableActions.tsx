import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC, useCallback, useMemo, useState } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { UnstakeRequestTableRow } from './UnstakeRequestTable';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../data/restake/useRestakeApi';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useNativeRestakeUnstakeExecuteTx from '../../data/restake/useNativeRestakeUnstakeExecuteTx';
import useDepositedRestakeUnstakeExecuteTx from '../../data/restake/useDepositedRestakeUnstakeExecuteTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
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

  const { execute: executeNominatedExecute, status: nominatedExecuteStatus } =
    useNativeRestakeUnstakeExecuteTx();

  const { execute: executeDepositedExecute, status: depositedExecuteStatus } =
    useDepositedRestakeUnstakeExecuteTx();

  const { execute: executeCancel, status: cancelStatus } =
    useNativeRestakeUnstakeCancelTx();

  const isReady =
    restakeApi !== null &&
    !isTransacting &&
    executeNominatedExecute !== null &&
    nominatedExecuteStatus !== TxStatus.PROCESSING &&
    executeDepositedExecute !== null &&
    depositedExecuteStatus !== TxStatus.PROCESSING &&
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
      if (!restakeApi) return;
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

    const nominatedNativeRequests = allRequests.filter(
      ({ assetId, isNomination }) =>
        assetId === NATIVE_ASSET_ID && isNomination === true,
    );

    const depositedNativeRequests = allRequests.filter(
      ({ assetId, isNomination }) =>
        assetId === NATIVE_ASSET_ID && isNomination === false,
    );

    const hasNonNativeUnstakeRequests = allRequests.some(
      ({ assetId }) => assetId !== NATIVE_ASSET_ID,
    );

    if (hasNonNativeUnstakeRequests) {
      if (!restakeApi) return;
      await restakeApi.executeUndelegate();
    }

    if (nominatedNativeRequests.length > 0) {
      await executeNominatedExecute(
        nominatedNativeRequests.map((request) => request.operatorAccountId),
      );
    }

    if (depositedNativeRequests.length > 0) {
      await executeDepositedExecute();
    }

    setIsTransacting(false);
  }, [
    allRequests,
    executeNominatedExecute,
    executeDepositedExecute,
    isReady,
    restakeApi,
  ]);

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
