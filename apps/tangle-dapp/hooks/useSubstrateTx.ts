import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import assert from 'assert';
import { useCallback, useEffect, useState } from 'react';

import { TxName } from '../constants';
import useNetworkStore from '../context/useNetworkStore';
import { GetSuccessMessageFunctionType } from '../types';
import ensureError from '../utils/ensureError';
import extractErrorFromTxStatus from '../utils/extractErrorFromStatus';
import { findInjectorForAddress, getApiPromise } from '../utils/polkadot';
import useActiveAccountAddress from './useActiveAccountAddress';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useIsMountedRef from './useIsMountedRef';
import useSubstrateAddress from './useSubstrateAddress';
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
  getSuccessMessageFnc?: GetSuccessMessageFunctionType<Context>,
  timeoutDelay = 120_000,
) {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [txHash, setTxHash] = useState<HexString | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();
  const activeSubstrateAddress = useSubstrateAddress();
  const isMountedRef = useIsMountedRef();
  const { rpcEndpoint } = useNetworkStore();

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

      const injector = await findInjectorForAddress(activeSubstrateAddress);
      const api = await getApiPromise(rpcEndpoint);
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
      activeSubstrateAddress,
      factory,
      isEvmAccount,
      isMountedRef,
      rpcEndpoint,
      status,
      getSuccessMessageFnc,
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
  getSuccessMessageFnc?: GetSuccessMessageFunctionType<Context>,
) {
  const activeAccountAddress = useActiveAccountAddress();

  const {
    execute: _execute,
    reset,
    status,
    error,
    txHash,
    successMessage,
  } = useSubstrateTx(factory, getSuccessMessageFnc);
  const { notifyProcessing, notifySuccess, notifyError } =
    useTxNotification(txName);

  const execute = useCallback(
    async (context: Context) => {
      if (_execute === null) {
        return;
      }
      notifyProcessing();

      await _execute(context);
    },
    [_execute, notifyProcessing],
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

    if (txHash !== null) {
      notifySuccess(txHash, successMessage);
    } else if (error !== null) {
      notifyError(error);
    }
  }, [status, error, txHash, notifyError, notifySuccess, successMessage]);

  return { execute, status, error, txHash, successMessage };
}
