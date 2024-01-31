import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect, useState } from 'react';

import { getPolkadotApiPromise } from '../constants';
import ensureError from '../utils/ensureError';
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

  const requestInjector = useCallback(async () => {
    if (activeSubstrateAddress === null) {
      return null;
    }

    return web3FromAddress(activeSubstrateAddress);
  }, [activeSubstrateAddress]);

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
    } else if (isEvmAccount) {
      throw new Error(
        `Attempted to execute a Substrate transaction from an EVM account. Use an EVM-equivalent transaction or Precompile call instead.`
      );
    }

    let isMounted = true;
    const injector = await requestInjector();
    const api = await getPolkadotApiPromise();
    const tx = await factory(api, activeSubstrateAddress);

    // Factory is not yet ready to produce the transaction.
    // This is usually because the user hasn't yet connected their wallet.
    if (tx === null) {
      return;
    }
    // Wait until the injector is ready.
    else if (injector === null) {
      return;
    } else if (!isMounted) {
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
          if (!isMounted) {
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

    return () => {
      isMounted = false;
    };
  }, [activeSubstrateAddress, factory, isEvmAccount, requestInjector, status]);

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

  return { execute, status, error, hash };
}

export default useSubstrateTx;
