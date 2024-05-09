import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, http, isHex } from 'viem';
import { avalanche } from 'viem/chains';

import useViemPublicClient from '../../hooks/useViemPublicClient';
import ensureError from '../../utils/ensureError';
import useServiceDetails from './useServiceDetails';

export default function usePermittedCaller() {
  const { notificationApi } = useWebbUI();
  const publicClient = useViemPublicClient();
  const { serviceDetails } = useServiceDetails();

  const [isContract, setIsContract] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const permittedCaller = useMemo(
    () => serviceDetails?.permittedCaller ?? null,
    [serviceDetails?.permittedCaller]
  );

  useEffect(() => {
    const checkPermittedCaller = async () => {
      try {
        // if (permittedCaller === null || !isHex(permittedCaller)) return;
        // const bytecode = await publicClient?.getBytecode({
        //   address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        // });
        const goerliClient = createPublicClient({
          chain: avalanche,
          transport: http(),
        });
        // const bytecode = await goerliClient.getBytecode({
        //   address: '0xC0a57A72cb7da55Da2E50f664b1641570941618f',
        // });
        const bytecode = await goerliClient.getBytecode({
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        });
        if (bytecode !== undefined) {
          setIsContract(true);
        }
      } catch (error) {
        notificationApi({
          variant: 'error',
          message:
            'Failed to check if the permitted caller is a contract or not',
        });
        setError(ensureError(error));
      } finally {
        setIsLoading(false);
      }
    };

    checkPermittedCaller();
  }, [notificationApi, permittedCaller, publicClient]);

  return {
    permittedCaller,
    isContract,
    isLoading,
    error,
  };
}
