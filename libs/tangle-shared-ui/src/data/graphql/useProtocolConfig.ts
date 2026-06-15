/**
 * Hook to fetch protocol configuration from the MultiAssetDelegation contract.
 * Replaces the Substrate-based protocol constants hook.
 */

import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { zeroAddress } from 'viem';
import { useResilientReadContracts } from '../../hooks/useResilientReadContracts';

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
  const chainId = useChainId();

  const contracts = useMemo(() => {
    try {
      return getContractsByChainId(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  const contractAddress = contracts?.multiAssetDelegation;

  const unsupportedConfig = useMemo<ProtocolConfigResult | null>(() => {
    if (!contracts || !contractAddress) {
      return asUnsupportedProtocolConfig('unknown_chain');
    }

    if (contractAddress.toLowerCase() === zeroAddress) {
      return asUnsupportedProtocolConfig(
        'missing_contract_address',
        contractAddress,
      );
    }

    return null;
  }, [contractAddress, contracts]);

  const configReads = useResilientReadContracts({
    queryKey: ['protocolConfig', chainId, contractAddress] as const,
    chainId,
    contracts:
      unsupportedConfig === null && contractAddress
        ? PROTOCOL_CONFIG_FUNCTIONS.map((functionName) => ({
            address: contractAddress,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName,
          }))
        : [],
    query: {
      enabled: enabled && unsupportedConfig === null && !!contractAddress,
      staleTime: 2_000,
      refetchInterval: enabled ? 2_000 : false,
      refetchIntervalInBackground: true,
    },
  });

  const data = useMemo<ProtocolConfigResult | undefined>(() => {
    if (unsupportedConfig !== null) {
      return unsupportedConfig;
    }

    if (!contractAddress || !configReads.data) {
      return undefined;
    }

    const values = new Map<ProtocolConfigFunction, bigint>();
    configReads.data.forEach((result, index) => {
      if (result.status === 'success') {
        values.set(PROTOCOL_CONFIG_FUNCTIONS[index], result.result as bigint);
      }
    });

    const config = asSupportedProtocolConfig(values);
    if (config) {
      return config;
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('Protocol config unsupported: read failures', {
        chainId,
        contractAddress,
      });
    }

    return asUnsupportedProtocolConfig('contract_read_failed', contractAddress);
  }, [chainId, configReads.data, contractAddress, unsupportedConfig]);

  return {
    ...configReads,
    data,
    isLoading: unsupportedConfig === null && configReads.isLoading,
    isError: unsupportedConfig === null && configReads.isError,
    error: unsupportedConfig === null ? configReads.error : null,
  };
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
