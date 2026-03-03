/**
 * Hook to fetch protocol configuration from the MultiAssetDelegation contract.
 * Replaces the Substrate-based useRestakeConsts hook.
 */

import { useQuery } from '@tanstack/react-query';
import { usePublicClient, useChainId } from 'wagmi';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { zeroAddress } from 'viem';

// Protocol configuration
export interface ProtocolConfig {
  // Current round number
  currentRound: bigint;
  // Round duration in seconds
  roundDuration: bigint;
  // Delay in rounds before delegator unstake is ready
  delegationBondLessDelay: bigint;
  // Delay in rounds before delegator withdrawal is ready
  leaveDelegatorsDelay: bigint;
  // Delay in rounds before operator can leave
  leaveOperatorsDelay: bigint;
}

const PROTOCOL_CONFIG_FUNCTIONS = [
  'currentRound',
  'roundDuration',
  'delegationBondLessDelay',
  'leaveDelegatorsDelay',
  'leaveOperatorsDelay',
] as const;

type ProtocolConfigFunction = (typeof PROTOCOL_CONFIG_FUNCTIONS)[number];

export type UnsupportedProtocolConfigReason =
  | 'unknown_chain'
  | 'missing_contract_address'
  | 'missing_contract_bytecode'
  | 'contract_read_failed';

export type ProtocolConfigResult =
  | ({ isSupported: true } & ProtocolConfig)
  | {
      isSupported: false;
      reason: UnsupportedProtocolConfigReason;
      contractAddress?: string;
    };

const asSupportedProtocolConfig = (
  values: Map<ProtocolConfigFunction, bigint>,
): ProtocolConfigResult | null => {
  const currentRound = values.get('currentRound');
  const roundDuration = values.get('roundDuration');
  const delegationBondLessDelay = values.get('delegationBondLessDelay');
  const leaveDelegatorsDelay = values.get('leaveDelegatorsDelay');
  const leaveOperatorsDelay = values.get('leaveOperatorsDelay');

  if (
    currentRound === undefined ||
    roundDuration === undefined ||
    delegationBondLessDelay === undefined ||
    leaveDelegatorsDelay === undefined ||
    leaveOperatorsDelay === undefined
  ) {
    return null;
  }

  return {
    isSupported: true,
    currentRound,
    roundDuration,
    delegationBondLessDelay,
    leaveDelegatorsDelay,
    leaveOperatorsDelay,
  };
};

const asUnsupportedProtocolConfig = (
  reason: UnsupportedProtocolConfigReason,
  contractAddress?: string,
): ProtocolConfigResult => {
  return {
    isSupported: false,
    reason,
    contractAddress,
  };
};

/**
 * Hook to fetch protocol configuration from the contract.
 *
 * @example
 * ```tsx
 * const { data: config, isLoading } = useProtocolConfig();
 *
 * console.log(config?.currentRound); // Current round number
 * console.log(config?.leaveDelegatorsDelay); // Rounds until withdrawal is ready
 * ```
 */
export const useProtocolConfig = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options ?? {};
  const publicClient = usePublicClient();
  const chainId = useChainId();

  return useQuery<ProtocolConfigResult>({
    queryKey: ['protocolConfig', chainId, publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      let contracts: ReturnType<typeof getContractsByChainId>;

      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        return asUnsupportedProtocolConfig('unknown_chain');
      }

      const contractAddress = contracts.multiAssetDelegation;
      if (contractAddress.toLowerCase() === zeroAddress) {
        return asUnsupportedProtocolConfig(
          'missing_contract_address',
          contractAddress,
        );
      }

      let bytecode: Awaited<ReturnType<typeof publicClient.getCode>>;
      try {
        bytecode = await publicClient.getCode({ address: contractAddress });
      } catch {
        return asUnsupportedProtocolConfig(
          'contract_read_failed',
          contractAddress,
        );
      }
      if (!bytecode || bytecode === '0x') {
        return asUnsupportedProtocolConfig(
          'missing_contract_bytecode',
          contractAddress,
        );
      }

      const readDirect = async (
        functionName: ProtocolConfigFunction,
      ): Promise<bigint> => {
        return (await publicClient.readContract({
          address: contractAddress,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName,
        })) as bigint;
      };

      const readAllDirect = async (): Promise<ProtocolConfigResult | null> => {
        const directResults = await Promise.allSettled(
          PROTOCOL_CONFIG_FUNCTIONS.map((functionName) =>
            readDirect(functionName),
          ),
        );
        const values = new Map<ProtocolConfigFunction, bigint>();

        directResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            values.set(PROTOCOL_CONFIG_FUNCTIONS[index], result.value);
          }
        });

        return asSupportedProtocolConfig(values);
      };

      // If multicall3 isn't configured for this chain, fall back to individual calls.
      if (publicClient.chain?.contracts?.multicall3?.address === undefined) {
        const directConfig = await readAllDirect();
        if (directConfig) {
          return directConfig;
        }

        return asUnsupportedProtocolConfig(
          'contract_read_failed',
          contractAddress,
        );
      }

      // Multicall to fetch all config values at once
      let results: Awaited<ReturnType<typeof publicClient.multicall>>;
      try {
        results = await publicClient.multicall({
          contracts: PROTOCOL_CONFIG_FUNCTIONS.map((functionName) => ({
            address: contractAddress,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName,
          })),
        });
      } catch {
        const directConfig = await readAllDirect();
        if (directConfig) {
          return directConfig;
        }
        return asUnsupportedProtocolConfig(
          'contract_read_failed',
          contractAddress,
        );
      }

      const values = new Map<ProtocolConfigFunction, bigint>();
      const failedFunctions: ProtocolConfigFunction[] = [];
      const typedResults = results as Array<
        | { status: 'success'; result: bigint }
        | { status: 'failure'; error: unknown }
      >;

      typedResults.forEach((result, index) => {
        const functionName = PROTOCOL_CONFIG_FUNCTIONS[index];
        if (result.status === 'success') {
          values.set(functionName, result.result);
          return;
        }
        failedFunctions.push(functionName);
      });

      // If multicall returned failures (e.g. broken multicall3), attempt direct reads for missing values.
      if (failedFunctions.length > 0) {
        const directFallbackResults = await Promise.allSettled(
          failedFunctions.map((functionName) => readDirect(functionName)),
        );

        directFallbackResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            values.set(failedFunctions[index], result.value);
          }
        });
      }

      const config = asSupportedProtocolConfig(values);
      if (config) {
        return config;
      }

      if (process.env.NODE_ENV === 'development') {
        console.debug('Protocol config unsupported: read failures', {
          chainId,
          contractAddress,
          failedFunctions,
        });
      }

      return asUnsupportedProtocolConfig(
        'contract_read_failed',
        contractAddress,
      );
    },
    enabled: enabled && !!publicClient,
    staleTime: 60_000, // 1 minute - config values rarely change
    refetchInterval: 60_000, // Refresh every minute
  });
};

/**
 * Hook to get withdrawal delay in human-readable format.
 */
export const useWithdrawalDelay = () => {
  const { data: config, isLoading } = useProtocolConfig();

  if (isLoading || !config || !config.isSupported) {
    return { delay: null, isLoading };
  }

  // Calculate delay in seconds
  const delaySeconds = config.leaveDelegatorsDelay * config.roundDuration;

  return {
    delay: delaySeconds,
    delayRounds: config.leaveDelegatorsDelay,
    roundDuration: config.roundDuration,
    isLoading: false,
  };
};

/**
 * Hook to get undelegate delay in human-readable format.
 */
export const useUndelegateDelay = () => {
  const { data: config, isLoading } = useProtocolConfig();

  if (isLoading || !config || !config.isSupported) {
    return { delay: null, isLoading };
  }

  // Calculate delay in seconds
  const delaySeconds = config.delegationBondLessDelay * config.roundDuration;

  return {
    delay: delaySeconds,
    delayRounds: config.delegationBondLessDelay,
    roundDuration: config.roundDuration,
    isLoading: false,
  };
};

export default useProtocolConfig;
