/**
 * Hook for fetching epoch and budget information from InflationPool contract.
 * Returns epoch budget, length, pool balance, and distribution weights.
 */

import { useMemo } from 'react';
import { useReadContracts, useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import INFLATION_POOL_ABI from '@tangle-network/tangle-shared-ui/abi/inflationPool';

export interface DistributionWeights {
  stakingBps: number;
  operatorsBps: number;
  customersBps: number;
  developersBps: number;
  restakersBps: number;
}

export interface EpochInfoData {
  currentEpoch: bigint;
  epochLength: bigint; // seconds
  epochBudget: bigint;
  poolBalance: bigint;
  secondsUntilNextEpoch: bigint;
  isEpochReady: boolean;
  weights: DistributionWeights;
  // Computed values for APY calculations
  epochsPerYear: number;
  stakingBudgetPerEpoch: bigint;
}

interface UseEpochInfoOptions {
  enabled?: boolean;
}

const useEpochInfo = (options?: UseEpochInfoOptions) => {
  const enabled = options?.enabled ?? true;
  const chainId = useChainId();

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }

  const {
    data: results,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts:
      enabled && contracts
        ? [
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'currentEpoch',
            },
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'epochLength',
            },
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'calculateEpochBudget',
            },
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'poolBalance',
            },
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'secondsUntilNextEpoch',
            },
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'isEpochReady',
            },
            {
              address: contracts.inflationPool,
              abi: INFLATION_POOL_ABI,
              functionName: 'getWeights',
            },
          ]
        : [],
    query: {
      enabled: enabled && !!contracts,
      refetchInterval: enabled ? 60000 : false, // Refresh every minute
    },
  });

  const data = useMemo<EpochInfoData | null>(() => {
    if (!results || results.length < 7) {
      return null;
    }

    // Check all results are successful
    const r0 = results[0];
    const r1 = results[1];
    const r2 = results[2];
    const r3 = results[3];
    const r4 = results[4];
    const r5 = results[5];
    const r6 = results[6];

    if (
      r0?.status !== 'success' ||
      r1?.status !== 'success' ||
      r2?.status !== 'success' ||
      r3?.status !== 'success' ||
      r4?.status !== 'success' ||
      r5?.status !== 'success' ||
      r6?.status !== 'success'
    ) {
      return null;
    }

    const currentEpoch = r0.result as bigint;
    const epochLength = r1.result as bigint;
    const epochBudget = r2.result as bigint;
    const poolBalance = r3.result as bigint;
    const secondsUntilNextEpoch = r4.result as bigint;
    const isEpochReady = r5.result as boolean;
    const weightsResult = r6.result as [number, number, number, number, number];

    const weights: DistributionWeights = {
      stakingBps: weightsResult[0],
      operatorsBps: weightsResult[1],
      customersBps: weightsResult[2],
      developersBps: weightsResult[3],
      restakersBps: weightsResult[4],
    };

    // Calculate epochs per year (365 days * 24 hours * 60 mins * 60 secs / epoch length)
    const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);
    const epochsPerYear =
      epochLength > BigInt(0) ? Number(SECONDS_PER_YEAR / epochLength) : 0;

    // Calculate staking budget per epoch
    const stakingBudgetPerEpoch =
      (epochBudget * BigInt(weights.stakingBps)) / BigInt(10000);

    return {
      currentEpoch,
      epochLength,
      epochBudget,
      poolBalance,
      secondsUntilNextEpoch,
      isEpochReady,
      weights,
      epochsPerYear,
      stakingBudgetPerEpoch,
    };
  }, [results]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch,
  };
};

export default useEpochInfo;
