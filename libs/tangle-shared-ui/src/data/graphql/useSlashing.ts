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
} from '../../utils/executeEnvioGraphQL';

// Slash status enum
export type SlashStatus = 'Pending' | 'Executed' | 'Cancelled' | 'Disputed';

// Slash proposal structure
export interface SlashProposal {
  id: bigint;
  serviceId: bigint;
  operator: Address;
  proposer: Address;
  amount: bigint;
  effectiveAmount: bigint;
  evidence: `0x${string}`;
  proposedAt: bigint;
  executeAfter: bigint;
  status: SlashStatus;
  disputeReason: string | null;
}

// Raw response from GraphQL
interface SlashProposalsResponse {
  SlashProposal: Array<{
    id: string;
    slashId: string;
    serviceId: string;
    operator: string;
    proposer: string;
    amount: string;
    effectiveAmount: string;
    evidence: string;
    proposedAt: string;
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

// Fetch slash proposals for an operator
const fetchSlashProposals = async (
  operator: Address,
  network?: EnvioNetwork,
): Promise<SlashProposal[]> => {
  const query = gql`
    query GetSlashProposals($operator: String!) {
      SlashProposal(
        where: { operator: { _eq: $operator } }
        order_by: { proposedAt: desc }
      ) {
        id
        slashId
        serviceId
        operator
        proposer
        amount
        effectiveAmount
        evidence
        proposedAt
        executeAfter
        status
        disputeReason
      }
    }
  `;

  try {
    const result = await executeEnvioGraphQL<
      SlashProposalsResponse,
      { operator: string }
    >(query, { operator: operator.toLowerCase() }, network);

    return (result.data.SlashProposal ?? []).map((sp) => ({
      id: BigInt(sp.slashId),
      serviceId: BigInt(sp.serviceId),
      operator: sp.operator as Address,
      proposer: sp.proposer as Address,
      amount: BigInt(sp.amount),
      effectiveAmount: BigInt(sp.effectiveAmount),
      evidence: sp.evidence as `0x${string}`,
      proposedAt: BigInt(sp.proposedAt),
      executeAfter: BigInt(sp.executeAfter),
      status: parseSlashStatus(sp.status),
      disputeReason: sp.disputeReason,
    }));
  } catch (error) {
    console.error('Failed to fetch slash proposals:', error);
    return [];
  }
};

/**
 * Hook to fetch slash proposals for the current user as an operator.
 */
export const useSlashProposals = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address } = useAccount();

  return useQuery({
    queryKey: ['slashing', 'proposals', address, network],
    queryFn: async () => {
      if (!address) return [];
      return fetchSlashProposals(address, network);
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
