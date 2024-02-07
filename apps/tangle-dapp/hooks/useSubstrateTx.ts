import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { useCallback, useEffect, useRef, useState } from 'react';

import ensureError from '../utils/ensureError';
import { getInjector, getPolkadotApiPromise } from '../utils/polkadot';
import prepareTxNotification from '../utils/prepareTxNotification';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useSubstrateAddress from './useSubstrateAddress';

export enum TxStatus {
  NotYetInitiated,
  Processing,
  Error,
  Complete,
  TimedOut,
}

export type TxFactory<T extends ISubmittableResult> = (
  api: ApiPromise,
  activeSubstrateAddress: string
) => Promise<SubmittableExtrinsic<'promise', T> | null>;

function useSubstrateTx<T extends ISubmittableResult>(
  factory: TxFactory<T>,
  notifyStatusUpdates = false,
  timeoutDelay = 60_000
) {
  const [status, setStatus] = useState(TxStatus.NotYetInitiated);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { notificationApi } = useWebbUI();
  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();
  const activeSubstrateAddress = useSubstrateAddress();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!notifyStatusUpdates) {
      return;
    }

    const notificationOpts = prepareTxNotification(status, error);

    if (notificationOpts === null) {
      return;
    }

    notificationApi(notificationOpts);
  }, [error, error?.message, notificationApi, notifyStatusUpdates, status]);

  const execute = useCallback(async () => {
    // Prevent the consumer from re-triggering the transaction
    // while it's still processing. Also wait for the Substrate
    // address to be set.
    if (
      status === TxStatus.Processing ||
      activeSubstrateAddress === null ||
      isEvmAccount === null
    ) {
      return;
    }

    // Catch logic errors.
    assert(
      !isEvmAccount,
      'Should not be able to execute a Substrate transaction while the active account is an EVM account'
    );

    const injector = await getInjector(activeSubstrateAddress);
    const api = await getPolkadotApiPromise();
    let tx: SubmittableExtrinsic<'promise', T> | null;

    // The transaction factory may throw an error if it encounters
    // a problem, such as invalid input data. Need to handle that case
    // gracefully here.
    try {
      tx = await factory(api, activeSubstrateAddress);
    } catch (possibleError: unknown) {
      setError(ensureError(possibleError));
      setStatus(TxStatus.Error);

      return;
    }

    // Factory is not yet ready to produce the transaction.
    // This is usually because the user hasn't yet connected their wallet.
    if (tx === null) {
      return;
    }
    // Wait until the injector is ready.
    else if (injector === null) {
      return;
    }

    // At this point, the transaction is ready to be sent.
    // Reset the status and error, and begin the transaction.
    setError(null);
    setHash(null);
    setStatus(TxStatus.Processing);

    try {
      await tx.signAndSend(
        activeSubstrateAddress,
        { signer: injector.signer },
        (status) => {
          if (!isMountedRef.current) {
            return;
          }

          setHash(status.txHash.toHex());

          const didSucceed = !status.isError && !status.isWarning;

          setStatus(didSucceed ? TxStatus.Complete : TxStatus.Error);

          if (!didSucceed) {
            setError(ensureError(status.internalError));
          }
        }
      );
    } catch (possibleError: unknown) {
      setStatus(TxStatus.Error);
      setError(ensureError(possibleError));
    }
  }, [activeSubstrateAddress, factory, isEvmAccount, status]);

  // Timeout the transaction if it's taking too long. This
  // won't cancel it, but it will alert the user that something
  // may have gone wrong, and also unlock anything waiting for
  // the transaction to complete, so that the user can try again
  // if they want.
  useEffect(() => {
    const timeoutHandle =
      status === TxStatus.Processing
        ? setTimeout(() => {
            setStatus(TxStatus.TimedOut);
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
  return { execute: isEvmAccount ? null : execute, status, error, hash };
}

export default useSubstrateTx;
