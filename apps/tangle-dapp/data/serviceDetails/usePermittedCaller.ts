import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useEffect, useMemo, useState } from 'react';
import { isHex } from 'viem';

import useNetworkStore from '../../context/useNetworkStore';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import ensureError from '../../utils/ensureError';
import useServiceDetails from './useServiceDetails';

const CONTRACT_API_PATH = '/api/v2/smart-contracts/';

export default function usePermittedCaller() {
  const { network } = useNetworkStore();
  const { notificationApi } = useWebbUI();
  const publicClient = useViemPublicClient();
  const { serviceDetails } = useServiceDetails();

  const [codeData, setCodeData] = useState<{
    sourceCode: string;
    language: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const permittedCaller = useMemo(
    () => serviceDetails?.permittedCaller ?? null,
    [serviceDetails?.permittedCaller],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (permittedCaller === null || !isHex(permittedCaller)) {
          setCodeData(null);
          return;
        }

        // Get the bytecode to check if the address is a contract or not
        const bytecode = await publicClient?.getBytecode({
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        });

        // the address is not a contract
        if (!bytecode) {
          setCodeData(null);
          return;
        }

        // Note: Currently there is no contract on both Tangle Testnet and Mainnet
        // This follows the api provided by Blockscout: https://testnet-explorer.tangle.tools/api-docs
        const fetchUrl = new URL(
          `${CONTRACT_API_PATH}/${permittedCaller}`,
          network.evmExplorerUrl,
        ).toString();

        const res = await fetch(fetchUrl);
        if (!res.ok) {
          throw new Error();
        }

        const data = await res.json();
        setCodeData({
          sourceCode: data['source_code'],
          language: languageExtensionMap[data['language']],
        });
      } catch (error) {
        notificationApi({
          variant: 'error',
          message: 'Failed to get permitted caller',
        });
        setError(ensureError(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [notificationApi, permittedCaller, publicClient, network.evmExplorerUrl]);

  return {
    permittedCaller,
    codeData,
    isLoading,
    error,
  };
}

// 3 types of smart contract languages returned from Blockscout
// need to get the extension to format code in the CodeFile component
const languageExtensionMap: Record<string, string> = {
  solidity: 'sol',
  vyper: 'vy',
  yul: 'yul',
};
