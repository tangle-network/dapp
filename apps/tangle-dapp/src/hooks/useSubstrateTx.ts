import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { PromiseOrT } from '@tangle-network/abstract-api-provider';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import useSubstrateInjectedExtension from '@tangle-network/tangle-shared-ui/hooks/useSubstrateInjectedExtension';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import useIsMountedRef from '@tangle-network/ui-components/hooks/useIsMountedRef';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import assert from 'assert';
import { useCallback, useEffect, useState } from 'react';
import { Hash } from 'viem';
import { TxName } from '../constants';
import useTxHistoryStore, {
  HistoryTxDetail,
} from '../context/useTxHistoryStore';
import { GetSuccessMessageFn } from '../types';
import extractErrorFromTxStatus from '../utils/extractErrorFromStatus';
import useTxNotification from './useTxNotification';

export enum TxStatus {
  NOT_YET_INITIATED,
  PROCESSING,
  ERROR,
  COMPLETE,
}

export type SubstrateTxFactory<Context = void> = (
  api: ApiPromise,
  activeSubstrateAddress: SubstrateAddress,
  context: Context,
) => PromiseOrT<SubmittableExtrinsic<'promise', ISubmittableResult> | null>;

type Options<Context = void> = {
  name: TxName;
  factory: SubstrateTxFactory<Context>;
  getDetails?: (context: Context) => Map<string, HistoryTxDetail>;
  getSuccessMessage?: GetSuccessMessageFn<Context>;
  overrideRpcEndpoint?: string;
};

const useSubstrateTx = <Context = void>({
  name,
  factory,
  getDetails,
  getSuccessMessage,
  overrideRpcEndpoint,
}: Options<Context>) => {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [txBlockHash, setTxBlockHash] = useState<Hash | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();
  const activeSubstrateAddress = useSubstrateAddress();
  const isMountedRef = useIsMountedRef();
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const injector = useSubstrateInjectedExtension();
  const { patchTx, pushTx } = useTxHistoryStore();
  const networkId = useNetworkStore((store) => store.network2?.id ?? null);

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
        isEvmAccount === null ||
        networkId === null
      ) {
        return;
      }

      assert(
        !isEvmAccount,
        'Should not be able to execute a Substrate transaction while the active account is an EVM account',
      );

      assert(
        injector !== null,
        'An injector should be available to sign and send the transaction',
      );

      const api = await getApiPromise(overrideRpcEndpoint ?? rpcEndpoint);
      let tx: SubmittableExtrinsic<'promise', ISubmittableResult> | null;

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
        setTxBlockHash(null);

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
      setTxBlockHash(null);
      setStatus(TxStatus.PROCESSING);

      const txHash = tx.hash.toHex();

      pushTx({
        hash: txHash,
        name,
        network: networkId,
        origin: activeSubstrateAddress,
        timestamp: Date.now(),
        status: 'pending',
        details: getDetails?.(context),
      });

      const handleStatusUpdate = (txStatus: ISubmittableResult) => {
        // TODO: Handle pending, in-block, & finalized states appropriately.s

        // If the component is unmounted, or the transaction
        // has not yet been included in a block, ignore the
        // status update.
        if (!isMountedRef.current || !txStatus.isInBlock) {
          return;
        }

        patchTx(txHash, { status: 'inblock' });
        setTxHash(txHash);
        setTxBlockHash(txStatus.status.asInBlock.toHex());

        const error = extractErrorFromTxStatus(txStatus);

        setStatus(error === null ? TxStatus.COMPLETE : TxStatus.ERROR);
        setError(error);

        if (error === null && getSuccessMessage !== undefined) {
          setSuccessMessage(getSuccessMessage(context));
        }

        if (error === null) {
          patchTx(txHash, { status: 'finalized' });
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
        setTxBlockHash(null);
        patchTx(txHash, { status: 'failed', errorMessage: error.message });
      }
    },
    [
      status,
      activeSubstrateAddress,
      isEvmAccount,
      networkId,
      injector,
      overrideRpcEndpoint,
      rpcEndpoint,
      pushTx,
      name,
      getDetails,
      factory,
      isMountedRef,
      patchTx,
      getSuccessMessage,
    ],
  );

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setTxHash(null);
    setTxBlockHash(null);
    setError(null);
  }, [setStatus, setTxHash, setTxBlockHash, setError]);

  return {
    // Prevent the consumer from executing the transaction if
    // the active account is an EVM account.
    execute: isEvmAccount ? null : execute,
    reset,
    status,
    error,
    txHash,
    txBlockHash,
    successMessage,
  };
};

export default useSubstrateTx;

// TODO: Merge this with `useSubstrateTx`.
export function useSubstrateTxWithNotification<Context = void>(
  txName: TxName,
  factory: SubstrateTxFactory<Context>,
  getSuccessMessage?: GetSuccessMessageFn<Context>,
  overrideRpcEndpoint?: string,
) {
  const activeAccountAddress = useActiveAccountAddress();
  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network.createExplorerTxUrl,
  );

  const {
    execute: execute_,
    reset,
    status,
    error,
    txHash,
    txBlockHash,
    successMessage,
  } = useSubstrateTx({
    name: txName,
    factory,
    getSuccessMessage,
    overrideRpcEndpoint,
  });

  const execute = useCallback(
    (context: Context) => {
      // TODO: Consider whether to change this to an assertion, since at this point the execute function shouldn't be null otherwise this function should not have been called.
      if (execute_ === null) {
        return;
      }

      notifyProcessing(txName);

      return execute_(context);
    },
    [execute_, notifyProcessing, txName],
  );

  useEffect(() => {
    if (activeAccountAddress === null) {
      reset();
    }
  }, [activeAccountAddress, reset]);

  // Automatically notify the user via a notification toast
  // on the status of the transaction, when the status changes.
  useEffect(() => {
    if (
      status === TxStatus.NOT_YET_INITIATED ||
      status === TxStatus.PROCESSING
    ) {
      return;
    }

    if (error !== null) {
      notifyError(txName, error);
    } else if (txHash !== null) {
      const explorerUrl = createExplorerTxUrl(
        false,
        txHash,
        txBlockHash ?? undefined,
      );

      notifySuccess(txName, explorerUrl, successMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, error]);

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
