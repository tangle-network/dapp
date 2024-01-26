import type { HexString } from '@polkadot/util/types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback } from 'react';

import { evmPublicClient } from '../utils/evm';

const useExecuteTxWithNotification = () => {
  const { notificationApi } = useWebbUI();
  const { activeWallet } = useWebContext();

  const executeTx = useCallback(
    async (
      evmFnc: () => Promise<HexString>,
      substrateFnc: () => Promise<HexString>,
      successMessage: string,
      errorMessage: string
    ) => {
      try {
        if (activeWallet?.platform === 'EVM') {
          const txHash = await evmFnc();
          if (!txHash) throw new Error(errorMessage);

          const tx = await evmPublicClient.waitForTransactionReceipt({
            hash: txHash,
          });
          if (tx.status !== 'success') throw new Error(errorMessage);
        } else if (activeWallet?.platform === 'Substrate') {
          const txHash = await substrateFnc();
          if (!txHash) throw new Error(errorMessage);
        }

        notificationApi({ variant: 'success', message: successMessage });
      } catch (error: any) {
        notificationApi({
          variant: 'error',
          message: isViemError(error)
            ? error.shortMessage
            : error.message || 'Something went wrong!',
        });

        throw error; // Rethrowing the error to be caught by the outer try-catch
      }
    },
    [notificationApi, activeWallet?.platform]
  );

  return executeTx;
};

export default useExecuteTxWithNotification;
