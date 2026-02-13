/**
 * Hooks for slashing - view proposals, dispute, cancel.
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
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';

// Slash status enum
export type SlashStatus = 'Pending' | 'Executed' | 'Cancelled' | 'Disputed';

// Slash proposal structure
export interface SlashProposal {
  id: bigint;
  serviceId: bigint;
  operator: Address;
  proposer: Address;
  slashBps: bigint;
  effectiveSlashBps: bigint;
  // Backwards-compatible aliases. Slash values are in bps, not token units.
  amount: bigint;
  effectiveAmount: bigint;
  evidence: `0x${string}`;
  proposedAt: bigint;
  executeAfter: bigint;
  status: SlashStatus;
  disputeReason: string | null;
}

export interface SlashDisputeEligibility {
  isEligible: boolean;
  reason: 'NotPending' | 'DeadlinePassed' | null;
  secondsUntilDeadline: number;
}

// Raw response from GraphQL
interface SlashProposalsResponse {
  SlashProposal: Array<{
    id: string;
    slashId: string;
    serviceId: string;
    operator: { id: string } | null;
    proposer: string;
    slashBps: string;
    effectiveSlashBps: string;
    evidence: string;
    createdAt: string;
    executeAfter: string;
    status: string;
    disputeReason: string | null;
  }>;
}

// Parse slash status from string
const parseSlashStatus = (status: string): SlashStatus => {
  switch (status.toLowerCase()) {
    case 'executed':
      return 'Executed';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    default:
      return 'Pending';
  }
};

/**
 * Converts slash basis points (bps) to a percentage string.
 * Example: 250 => "2.5%"
 */
export const formatSlashBps = (
  bps: bigint | number,
  maxFractionDigits = 2,
): string => {
  const value = typeof bps === 'bigint' ? Number(bps) : bps;
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const percentage = value / 100;
  return `${percentage.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  })}%`;
};

/**
 * Returns seconds remaining until dispute deadline.
 * Positive: time left, 0/negative: deadline reached or passed.
 */
export const getSlashDeadlineTimeRemainingSeconds = (
  executeAfter: bigint,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): number => Number(executeAfter) - nowUnixSeconds;

/**
 * Determines whether a slash is disputable right now.
 * Contract rule: status must be Pending and current time must be before executeAfter.
 */
export const getSlashDisputeEligibility = (
  slash: Pick<SlashProposal, 'status' | 'executeAfter'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): SlashDisputeEligibility => {
  if (slash.status !== 'Pending') {
    return {
      isEligible: false,
      reason: 'NotPending',
      secondsUntilDeadline: getSlashDeadlineTimeRemainingSeconds(
        slash.executeAfter,
        nowUnixSeconds,
      ),
    };
  }

  const secondsUntilDeadline = getSlashDeadlineTimeRemainingSeconds(
    slash.executeAfter,
    nowUnixSeconds,
  );

  if (secondsUntilDeadline <= 0) {
    return {
      isEligible: false,
      reason: 'DeadlinePassed',
      secondsUntilDeadline,
    };
  }

  return {
    isEligible: true,
    reason: null,
    secondsUntilDeadline,
  };
};

export const isSlashDisputeEligible = (
  slash: Pick<SlashProposal, 'status' | 'executeAfter'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): boolean => getSlashDisputeEligibility(slash, nowUnixSeconds).isEligible;

// Fetch slash proposals for an operator
const fetchSlashProposals = async (
  operator: Address,
  network?: EnvioNetwork,
): Promise<SlashProposal[]> => {
  const query = gql`
    query GetSlashProposals($operator: String!) {
      SlashProposal(
        where: { operator: { id: { _eq: $operator } } }
        order_by: { createdAt: desc }
      ) {
        id
        slashId
        serviceId
        operator {
          id
        }
        proposer
        slashBps: amount
        effectiveSlashBps: effectiveAmount
        evidence
        createdAt
        executeAfter
        status
        disputeReason
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    SlashProposalsResponse,
    { operator: string }
  >(query, { operator: operator.toLowerCase() }, network);

  if (result.errors?.length) {
    throw new Error(
      `Failed to fetch slash proposals: ${result.errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }

  return (result.data.SlashProposal ?? []).map((sp) => {
    const slashBps = BigInt(sp.slashBps);
    const effectiveSlashBps = BigInt(sp.effectiveSlashBps);

    return {
      id: BigInt(sp.slashId),
      serviceId: BigInt(sp.serviceId),
      operator: (sp.operator?.id ??
        '0x0000000000000000000000000000000000000000') as Address,
      proposer: sp.proposer as Address,
      slashBps,
      effectiveSlashBps,
      amount: slashBps,
      effectiveAmount: effectiveSlashBps,
      evidence: sp.evidence as `0x${string}`,
      proposedAt: BigInt(sp.createdAt),
      executeAfter: BigInt(sp.executeAfter),
      status: parseSlashStatus(sp.status),
      disputeReason: sp.disputeReason,
    };
  });
};

/**
 * Hook to fetch slash proposals for the current user as an operator.
 */
export const useSlashProposals = (options?: {
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
    queryKey: ['slashing', 'proposals', resolvedNetwork, address],
    queryFn: async () => {
      if (!address) return [];
      return fetchSlashProposals(address, resolvedNetwork);
    },
    enabled: enabled && !!address,
    staleTime: 30_000, // 30 seconds
  });
};

// Transaction status
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Hook to dispute a slash proposal.
 */
export const useDisputeSlashTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const disputeSlash = useCallback(
    async (slashId: bigint, reason: string): Promise<Hash | null> => {
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
          functionName: 'disputeSlash',
          args: [slashId, reason],
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
          err instanceof Error ? err : new Error('Failed to dispute slash');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    disputeSlash,
    status,
    error,
    reset,
  };
};

/**
 * Hook to cancel a slash proposal (for proposers).
 */
export const useCancelSlashTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const cancelSlash = useCallback(
    async (slashId: bigint, reason: string): Promise<Hash | null> => {
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
          functionName: 'cancelSlash',
          args: [slashId, reason],
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
          err instanceof Error ? err : new Error('Failed to cancel slash');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    cancelSlash,
    status,
    error,
    reset,
  };
};

/**
 * Format slash amount for display.
 */
export const formatSlashAmount = (amount: bigint, decimals = 18): string => {
  // Calculate divisor without using exponentiation operator
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor = divisor * BigInt(10);
  }
  const whole = amount / divisor;
  const fractional = amount % divisor;
  const fractionalStr = fractional
    .toString()
    .padStart(decimals, '0')
    .slice(0, 4);
  return `${whole}.${fractionalStr}`;
};

export default useSlashProposals;
