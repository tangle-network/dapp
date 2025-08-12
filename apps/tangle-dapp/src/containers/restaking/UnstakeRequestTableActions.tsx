import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { isScheduledRequestReady } from '../../pages/restake/utils';
import { UnstakeRequestTableRow } from './UnstakeRequestTable';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../data/restake/useRestakeApi';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useRestakeUnstakeExecuteAllTx from '../../data/restake/useRestakeUnstakeExecuteAllTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import useNativeRestakeUnstakeCancelTx from '../../data/restake/useNativeRestakeUnstakeCancelTx';

type UnstakeRequestTableActionsProps = {
  allRequests: UnstakeRequestTableRow[];
  selectedRequests: UnstakeRequestTableRow[];
  onExecuted: () => void;
};

const UnstakeRequestTableActions: FC<UnstakeRequestTableActionsProps> = ({
  allRequests,
  selectedRequests,
  onExecuted,
}) => {
  const restakeApi = useRestakeApi();

  const { execute: executeAll, status: executeAllStatus } =
    useRestakeUnstakeExecuteAllTx();

  const { execute: executeCancel, status: cancelStatus } =
    useNativeRestakeUnstakeCancelTx();

  const isExecuting = executeAllStatus === TxStatus.PROCESSING;
  const isCancelling = cancelStatus === TxStatus.PROCESSING;

  const isReady =
    restakeApi !== null &&
    executeAll !== null &&
    executeAllStatus !== TxStatus.PROCESSING &&
    executeCancel !== null &&
    cancelStatus !== TxStatus.PROCESSING;

  useEffect(() => {
    if (executeAllStatus === TxStatus.COMPLETE && onExecuted) {
      onExecuted();
    }
  }, [executeAllStatus, onExecuted]);

  const handleCancelUnstake = useCallback(async () => {
    if (!isReady) {
      return;
    }

    const nominatedUnstakeRequests = selectedRequests.filter(
      (request) => request.isNomination === true,
    );

    const depositedUnstakeRequests = selectedRequests.filter(
      (request) => request.isNomination !== true,
    );

    const depositedUnstakeRequestsForApi = depositedUnstakeRequests.map(
      ({ amountRaw, operatorAccountId, assetId }) => ({
        amount: new BN(amountRaw.toString()),
        assetId,
        operatorAddress: operatorAccountId,
      }),
    );

    if (depositedUnstakeRequestsForApi.length > 0) {
      if (!restakeApi) return;
      await restakeApi.cancelUndelegate(depositedUnstakeRequestsForApi);
    }

    if (nominatedUnstakeRequests.length > 0) {
      await executeCancel(
        nominatedUnstakeRequests.map((request) => request.operatorAccountId),
      );
    }
  }, [executeCancel, isReady, restakeApi, selectedRequests]);

  const handleExecuteUnstake = useCallback(async () => {
    if (!isReady) {
      return;
    }

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

    await executeAll({
      nominatedOperators: nominatedNativeRequests.map(
        (request) => request.operatorAccountId,
      ),
      hasDepositedRequests: depositedNativeRequests.length > 0,
      hasNonNativeRequests: hasNonNativeUnstakeRequests,
    });
  }, [allRequests, executeAll, isReady]);

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
        isLoading={isCancelling}
        isDisabled={!isReady || !canCancelUnstake}
        isFullWidth
        onClick={handleCancelUnstake}
        variant="secondary"
      >
        Cancel Undelegate
      </Button>

      <Button
        isLoading={isExecuting}
        isDisabled={!isReady || !canExecuteUnstake}
        onClick={handleExecuteUnstake}
        isFullWidth
      >
        Execute All
      </Button>
    </div>
  );
};

export default UnstakeRequestTableActions;
