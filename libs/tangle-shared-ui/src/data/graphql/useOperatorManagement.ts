/**
 * Hooks for operator management - registration, unregistration, preferences.
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  usePublicClient,
  useWalletClient,
  useChainId,
  useAccount,
} from 'wagmi';
import { Address, encodeFunctionData, type Hash } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

// Operator preferences structure
export interface OperatorPreferences {
  ecdsaPublicKey: `0x${string}`;
  rpcAddress: string;
}

// Operator registration for a blueprint
export interface OperatorRegistration {
  blueprintId: bigint;
  blueprintName: string;
  operator: Address;
  registeredAt: bigint;
  preferences: OperatorPreferences;
  active: boolean;
}

// Raw response from GraphQL
interface OperatorRegistrationsResponse {
  BlueprintOperator: Array<{
    id: string;
    operator: {
      id: string;
    };
    blueprint: {
      blueprintId: string;
      metadataUri: string | null;
    };
    registrationTimestamp: string | null;
    active: boolean;
    ecdsaKey: string | null;
    rpcEndpoint: string | null;
  }>;
}

// Fetch operator registrations for the current user
const fetchOperatorRegistrations = async (
  operator: Address,
  network?: EnvioNetwork,
): Promise<OperatorRegistration[]> => {
  const query = gql`
    query GetOperatorRegistrations($operator: String!) {
      BlueprintOperator(
        where: { operator_: { id: { _eq: $operator } } }
        order_by: { registrationTimestamp: desc }
      ) {
        id
        operator {
          id
        }
        blueprint {
          blueprintId
          metadataUri
        }
        registrationTimestamp
        active
        ecdsaKey
        rpcEndpoint
      }
    }
  `;

  try {
    const result = await executeEnvioGraphQL<
      OperatorRegistrationsResponse,
      { operator: string }
    >(query, { operator: operator.toLowerCase() }, network);

    // Fetch metadata for each blueprint
    const registrations = await Promise.all(
      (result.data.BlueprintOperator ?? []).map(async (reg) => {
        let blueprintName = `Blueprint #${reg.blueprint.blueprintId}`;

        if (reg.blueprint.metadataUri) {
          try {
            let fetchUrl = reg.blueprint.metadataUri;
            if (reg.blueprint.metadataUri.startsWith('ipfs://')) {
              const cid = reg.blueprint.metadataUri.replace('ipfs://', '');
              fetchUrl = `https://ipfs.io/ipfs/${cid}`;
            }
            const response = await fetch(fetchUrl, {
              signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
              const metadata = await response.json();
              blueprintName = metadata.name ?? blueprintName;
            }
          } catch {
            // Ignore metadata fetch errors
          }
        }

        return {
          blueprintId: BigInt(reg.blueprint.blueprintId),
          blueprintName,
          operator: reg.operator.id as Address,
          registeredAt: reg.registrationTimestamp
            ? BigInt(reg.registrationTimestamp)
            : BigInt(0),
          preferences: {
            ecdsaPublicKey: (reg.ecdsaKey ?? '0x') as `0x${string}`,
            rpcAddress: reg.rpcEndpoint ?? '',
          },
          active: reg.active,
        };
      }),
    );

    return registrations;
  } catch (error) {
    console.error('Failed to fetch operator registrations:', error);
    return [];
  }
};

/**
 * Hook to fetch blueprints the current user is registered as operator for.
 */
export const useOperatorRegistrations = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address } = useAccount();

  return useQuery({
    queryKey: ['operator', 'registrations', address, network],
    queryFn: async () => {
      if (!address) return [];
      return fetchOperatorRegistrations(address, network);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });
};

// Transaction status
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Hook to register as an operator for a blueprint.
 */
export const useRegisterOperatorTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const registerOperator = useCallback(
    async (
      blueprintId: bigint,
      preferences: OperatorPreferences,
      registrationArgs: `0x${string}` = '0x',
    ): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'registerOperator',
          args: [
            blueprintId,
            preferences.ecdsaPublicKey,
            preferences.rpcAddress,
            registrationArgs,
          ],
        });

        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setStatus('success');
        return hash;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to register as operator');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    registerOperator,
    status,
    error,
    reset,
  };
};

/**
 * Hook to unregister from a blueprint.
 */
export const useUnregisterOperatorTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const unregisterOperator = useCallback(
    async (blueprintId: bigint): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'unregisterOperator',
          args: [blueprintId],
        });

        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setStatus('success');
        return hash;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to unregister from blueprint');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    unregisterOperator,
    status,
    error,
    reset,
  };
};

/**
 * Hook to update operator preferences for a blueprint.
 */
export const useUpdateOperatorPreferencesTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const updatePreferences = useCallback(
    async (
      blueprintId: bigint,
      preferences: OperatorPreferences,
    ): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'updateOperatorPreferences',
          args: [blueprintId, preferences.ecdsaPublicKey, preferences.rpcAddress],
        });

        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setStatus('success');
        return hash;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to update operator preferences');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    updatePreferences,
    status,
    error,
    reset,
  };
};

export default useOperatorRegistrations;
