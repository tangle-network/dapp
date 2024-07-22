import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import assert from 'assert';
import { useCallback, useEffect, useState } from 'react';

import { TxName } from '../constants';
import useNetworkStore from '../context/useNetworkStore';
import { GetSuccessMessageFunction } from '../types';
import ensureError from '../utils/ensureError';
import extractErrorFromTxStatus from '../utils/extractErrorFromStatus';
import { getApiPromise } from '../utils/polkadot';
import useActiveAccountAddress from './useActiveAccountAddress';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useIsMountedRef from './useIsMountedRef';
import useSubstrateAddress from './useSubstrateAddress';
import useSubstrateInjectedExtension from './useSubstrateInjectedExtension';
import useTxNotification from './useTxNotification';

export enum TxStatus {
  NOT_YET_INITIATED,
  PROCESSING,
  ERROR,
  COMPLETE,
  TIMED_OUT,
}

export type SubstrateTxFactory<Context = void> = (
  api: ApiPromise,
  activeSubstrateAddress: string,
  context: Context,
) => PromiseOrT<SubmittableExtrinsic<'promise', ISubmittableResult> | null>;

function useSubstrateTx<Context = void>(
  factory: SubstrateTxFactory<Context>,
  getSuccessMessageFnc?: GetSuccessMessageFunction<Context>,
  timeoutDelay = 120_000,
  overrideRpcEndpoint?: string,
) {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [txHash, setTxHash] = useState<HexString | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();
  const activeSubstrateAddress = useSubstrateAddress();
  const isMountedRef = useIsMountedRef();
  const { rpcEndpoint } = useNetworkStore();
  const injector = useSubstrateInjectedExtension();

  // Useful for debugging.
  useEffect(() => {
    if (error !== null) {
      console.error(error);
    }
  }, [error]);

  const execute = useCallback(
    async (context: Context) => {
      // Prevent the consumer from re-triggering the transaction
      // while it's still processing. Also wait for the Substrate
      // address to be set.
      if (
        status === TxStatus.PROCESSING ||
        activeSubstrateAddress === null ||
        isEvmAccount === null
      ) {
        return;
      }

      assert(
        !isEvmAccount,
        'Should not be able to execute a Substrate transaction while the active account is an EVM account',
      );

      assert(
        injector !== null,
        'Should not be able to execute a Substrate transaction without an injector',
      );

      const api = await getApiPromise(overrideRpcEndpoint ?? rpcEndpoint);
      let tx: SubmittableExtrinsic<'promise', ISubmittableResult> | null;
      let newTxHash: HexString;

      // TODO: Consider resetting state here, before executing the tx. Or is it fine to keep the old state?

      // The transaction factory may throw an error if it encounters
      // a problem, such as invalid input data. Need to handle that case
      // gracefully here.
      try {
        tx = await factory(api, activeSubstrateAddress, context);
      } catch (possibleError: unknown) {
        const error = ensureError(possibleError);

        setError(error);
        setStatus(TxStatus.ERROR);
        setTxHash(null);

        return;
      }

      // Factory is not yet ready to produce the transaction.
      // This is usually because the user hasn't yet connected their wallet,
      // or the factory's requirements haven't been met.
      if (tx === null) {
        return;
      }
      // Injector might report that there are no installed wallet extensions.
      else if (injector === null) {
        return;
      }

      // At this point, the transaction is ready to be sent.
      // Reset the status and error, and begin the transaction.
      setError(null);
      setTxHash(null);
      setStatus(TxStatus.PROCESSING);

      const handleStatusUpdate = (status: ISubmittableResult) => {
        // If the component is unmounted, or the transaction
        // has not yet been included in a block, ignore the
        // status update.
        if (!isMountedRef.current || !status.isInBlock) {
          return;
        }

        newTxHash = status.txHash.toHex();
        setTxHash(newTxHash);

        const error = extractErrorFromTxStatus(status);

        setStatus(error === null ? TxStatus.COMPLETE : TxStatus.ERROR);
        setError(error);

        if (error === null && getSuccessMessageFnc !== undefined) {
          setSuccessMessage(getSuccessMessageFnc(context));
        }
      };

      try {
        await tx.signAndSend(
          activeSubstrateAddress,
          // Use a nonce of -1 to let the API calculate the nonce for us.
          // This is important as it prevents nonce collisions when multiple
          // transactions are sent in quick succession. Read more here:
          // https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
          { signer: injector.signer, nonce: -1 },
          handleStatusUpdate,
        );
      } catch (possibleError: unknown) {
        const error = ensureError(possibleError);

        setStatus(TxStatus.ERROR);
        setError(error);
        setTxHash(null);
      }
    },
    [
      status,
      activeSubstrateAddress,
      isEvmAccount,
      overrideRpcEndpoint,
      rpcEndpoint,
      factory,
      isMountedRef,
      getSuccessMessageFnc,
      injector,
    ],
  );

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setTxHash(null);
    setError(null);
  }, []);

  // Timeout the transaction if it's taking too long. This
  // won't cancel it, but it will alert the user that something
  // may have gone wrong, and also unlock anything waiting for
  // the transaction to complete, so that the user can try again
  // if they want.
  useEffect(() => {
    const timeoutHandle =
      status === TxStatus.PROCESSING
        ? setTimeout(() => {
            setStatus(TxStatus.TIMED_OUT);
          }, timeoutDelay)
        : null;

    return () => {
      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [status, timeoutDelay]);

  // Prevent the consumer from executing the transaction if
  // the active account is an EVM account.
  return {
    execute: isEvmAccount ? null : execute,
    reset,
    status,
    error,
    txHash,
    successMessage,
  };
}

export default useSubstrateTx;

export function useSubstrateTxWithNotification<Context = void>(
  txName: TxName,
  factory: SubstrateTxFactory<Context>,
  getSuccessMessageFnc?: GetSuccessMessageFunction<Context>,
  overrideRpcEndpoint?: string,
) {
  const activeAccountAddress = useActiveAccountAddress();

  const {
    execute: execute_,
    reset,
    status,
    error,
    txHash,
    successMessage,
  } = useSubstrateTx(
    factory,
    getSuccessMessageFnc,
    undefined,
    overrideRpcEndpoint,
  );

  const { notifyProcessing, notifySuccess, notifyError } =
    useTxNotification(txName);

  const execute = useCallback(
    (context: Context) => {
      // TODO: Consider whether to change this to an assertion, since at this point the execute function shouldn't be null otherwise this function should not have been called.
      if (execute_ === null) {
        return;
      }

      notifyProcessing();

      return execute_(context);
    },
    [execute_, notifyProcessing],
  );

  useEffect(() => {
    if (activeAccountAddress === null) {
      reset();
    }
  }, [activeAccountAddress, reset]);

  useEffect(() => {
    if (
      status === TxStatus.NOT_YET_INITIATED ||
      status === TxStatus.PROCESSING
    ) {
      return;
    }

    if (error !== null) {
      notifyError(error);
    } else if (txHash !== null) {
      notifySuccess(txHash, successMessage);
    }
  }, [status, error, txHash, notifyError, notifySuccess, successMessage]);

  return {
    // Prevent the consumer from executing the transaction if
    // the underlying hook is not ready to do so.
    execute: execute_ === null ? null : execute,
    status,
    error,
    txHash,
    successMessage,
  };
}
