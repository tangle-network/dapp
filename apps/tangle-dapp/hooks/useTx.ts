import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { useCallback, useEffect, useState } from 'react';

import { getPolkadotApiPromise } from '../constants';

export enum TxStatus {
  // Note that the value of these values is important.
  // It's used to determine the order of the steps in the UI.
  // Avoid changing the values of these enums values.
  NotInitiated = 0,
  Processing = 1,
  Error = 2,
  Complete = 3,
}

export type TxFactory<T extends ISubmittableResult> = (
  api: ApiPromise
) => Promise<SubmittableExtrinsic<'promise', T>>;

function useTx<T extends ISubmittableResult>(factory: TxFactory<T>) {
  const [status, setStatus] = useState(TxStatus.NotInitiated);
  const [hash, setHash] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const activeAccount = useActiveAccount();

  const getInjector = useCallback(async () => {
    if (activeAccount === null || activeAccount[0] === null) {
      return null;
    }

    return web3FromAddress(activeAccount[0].address);
  }, [activeAccount]);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (status === TxStatus.NotInitiated) {
      return;
    }

    setStatus(TxStatus.Processing);

    const signAndSend = async () => {
      if (activeAccount === null || activeAccount[0] === null) {
        return;
      }

      const senderAddress = activeAccount[0].address;
      const api = await getPolkadotApiPromise();
      const injector = await getInjector();
      const tx = await factory(api);

      // TODO: Need graceful error handling here: This can fail in many ways: The sender doesn't have enough balance, the recipient address is invalid, that it's sending to itself, or other reasons.
      tx.signAndSend(senderAddress, { signer: injector?.signer }, (status) => {
        if (!isMounted) {
          return;
        }

        if (hash === null) {
          setHash(status.txHash.toHex());
        }

        if (status.isInBlock || status.isFinalized) {
          setStatus(TxStatus.Processing);
        } else if (status.isError) {
          setStatus(TxStatus.Error);
        } else if (status.isCompleted) {
          setStatus(TxStatus.Complete);
        } else {
          setStatus(TxStatus.Error);
        }
      });
    };

    signAndSend();
  }, [activeAccount, factory, getInjector, hash, isMounted, status]);

  const perform = () => {
    if (status !== TxStatus.NotInitiated) {
      return;
    }

    setStatus(TxStatus.Processing);
  };

  const reset = () => {
    setStatus(TxStatus.NotInitiated);
    setHash(null);
  };

  return { perform, status, hash, reset };
}

export default useTx;
