/**
 * Hooks for operator management - registration, unregistration, preferences.
 */

import { useQuery } from '@tanstack/react-query';
import { useChainId, useAccount } from 'wagmi';
import { Address, type Hash } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';
import useContractWrite, {
  TxStatus as ContractTxStatus,
} from '../../hooks/useContractWrite';

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
  OperatorRegistration: Array<{
    id: string;
    operator: {
      id: string;
    };
    blueprint: {
      blueprintId: string;
      metadataUri: string | null;
    };
    status: 'ACTIVE' | 'UNREGISTERED';
    registeredAt: string | null;
    updatedAt: string | null;
    unregisteredAt: string | null;
    ecdsaPublicKey: string | null;
    rpcAddress: string | null;
  }>;
}

// Fetch operator registrations for the current user
const fetchOperatorRegistrations = async (
  operator: Address,
  network?: EnvioNetwork,
): Promise<OperatorRegistration[]> => {
  const query = gql`
    query GetOperatorRegistrations($operator: String!) {
      OperatorRegistration(
        where: { operator: { id: { _eq: $operator } } }
        order_by: { registeredAt: desc }
      ) {
        id
        operator {
          id
        }
        blueprint {
          blueprintId
          metadataUri
        }
        status
        registeredAt
        updatedAt
        unregisteredAt
        ecdsaPublicKey
        rpcAddress
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    OperatorRegistrationsResponse,
    { operator: string }
  >(query, { operator: operator.toLowerCase() }, network);

  if (result.errors?.length) {
    throw new Error(
      `Failed to fetch operator registrations: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  // Fetch metadata for each blueprint
  const registrations = await Promise.all(
    (result.data.OperatorRegistration ?? []).map(async (reg) => {
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
        registeredAt: reg.registeredAt ? BigInt(reg.registeredAt) : BigInt(0),
        preferences: {
          ecdsaPublicKey: (reg.ecdsaPublicKey ?? '0x') as `0x${string}`,
          rpcAddress: reg.rpcAddress ?? '',
        },
        active: reg.status === 'ACTIVE',
      };
    }),
  );

  return registrations;
};

/**
 * Hook to fetch blueprints the current user is registered as operator for.
 */
export const useOperatorRegistrations = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['operator', 'registrations', resolvedNetwork, address],
    queryFn: async () => {
      if (!address) return [];
      return fetchOperatorRegistrations(address, resolvedNetwork);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });
};

// Transaction status
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

interface RegisterOperatorParams {
  blueprintId: bigint;
  preferences: OperatorPreferences;
  registrationArgs: `0x${string}`;
}

interface UnregisterOperatorParams {
  blueprintId: bigint;
}

interface UpdateOperatorPreferencesParams {
  blueprintId: bigint;
  preferences: OperatorPreferences;
}

const mapContractWriteStatus = (status: ContractTxStatus): TxStatus => {
  switch (status) {
    case ContractTxStatus.PROCESSING:
      return 'pending';
    case ContractTxStatus.COMPLETE:
      return 'success';
    case ContractTxStatus.ERROR:
      return 'error';
    default:
      return 'idle';
  }
};

/**
 * Hook to register as an operator for a blueprint.
 */
export const useRegisterOperatorTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: RegisterOperatorParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'registerOperator' as const,
        args: [
          params.blueprintId,
          params.preferences.ecdsaPublicKey,
          params.preferences.rpcAddress,
          params.registrationArgs,
        ] as const,
      };
    },
    {
      txName: 'register operator',
      txDetails: (params) =>
        new Map([
          ['Blueprint ID', params.blueprintId.toString()],
          ['RPC Endpoint', params.preferences.rpcAddress],
        ]),
      getSuccessMessage: (params) =>
        `Operator registered for blueprint #${params.blueprintId}`,
    },
  );

  const registerOperator = async (
    blueprintId: bigint,
    preferences: OperatorPreferences,
    registrationArgs: `0x${string}` = '0x',
  ): Promise<Hash | null> => {
    const result = await hook.execute?.({
      blueprintId,
      preferences,
      registrationArgs,
    });
    return result?.hash ?? null;
  };

  return {
    registerOperator,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Hook to unregister from a blueprint.
 */
export const useUnregisterOperatorTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: UnregisterOperatorParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'unregisterOperator' as const,
        args: [params.blueprintId] as const,
      };
    },
    {
      txName: 'unregister operator',
      txDetails: (params) =>
        new Map([['Blueprint ID', params.blueprintId.toString()]]),
      getSuccessMessage: (params) =>
        `Operator unregistered from blueprint #${params.blueprintId}`,
    },
  );

  const unregisterOperator = async (blueprintId: bigint): Promise<Hash | null> => {
    const result = await hook.execute?.({ blueprintId });
    return result?.hash ?? null;
  };

  return {
    unregisterOperator,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

/**
 * Hook to update operator preferences for a blueprint.
 */
export const useUpdateOperatorPreferencesTx = () => {
  const chainId = useChainId();
  const hook = useContractWrite(
    TANGLE_ABI,
    (params: UpdateOperatorPreferencesParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'updateOperatorPreferences' as const,
        args: [
          params.blueprintId,
          params.preferences.ecdsaPublicKey,
          params.preferences.rpcAddress,
        ] as const,
      };
    },
    {
      txName: 'update operator preferences',
      txDetails: (params) =>
        new Map([
          ['Blueprint ID', params.blueprintId.toString()],
          ['RPC Endpoint', params.preferences.rpcAddress],
        ]),
      getSuccessMessage: (params) =>
        `Preferences updated for blueprint #${params.blueprintId}`,
    },
  );

  const updatePreferences = async (
    blueprintId: bigint,
    preferences: OperatorPreferences,
  ): Promise<Hash | null> => {
    const result = await hook.execute?.({ blueprintId, preferences });
    return result?.hash ?? null;
  };

  return {
    updatePreferences,
    status: mapContractWriteStatus(hook.status),
    error: hook.error,
    reset: hook.reset,
  };
};

export default useOperatorRegistrations;
