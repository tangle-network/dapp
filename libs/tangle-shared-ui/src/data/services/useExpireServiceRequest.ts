/**
 * Hook for permissionlessly expiring a stale service request.
 *
 * `expireServiceRequest` is callable by anyone once `block.timestamp >
 * req.createdAt + REQUEST_EXPIRY_GRACE_PERIOD`. Calling it refunds the
 * requester and unlocks the operator candidates, so it is safe — and
 * incentive-aligned — to expose as a "Clean up expired request" action.
 *
 * This hook only handles the on-chain write. Callers are responsible for
 * gating the button on the grace period using
 * REQUEST_EXPIRY_GRACE_PERIOD_SECONDS, and for invalidating any request /
 * service queries on success.
 */

import { useChainId } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import useContractWrite, { TxStatus } from '../../hooks/useContractWrite';
import TangleABI from '../../abi/tangle';

export { TxStatus };

/**
 * Mirrors `ProtocolConfig.REQUEST_EXPIRY_GRACE_PERIOD` (1 hour) from tnt-core.
 * The contract allows admins to override `_requestExpiryGracePeriod`, but no
 * getter is currently exposed for it; this constant reflects the protocol
 * default and is the conservative gate to use in the UI.
 */
export const REQUEST_EXPIRY_GRACE_PERIOD_SECONDS = BigInt(60 * 60);

export interface ExpireServiceRequestParams {
  requestId: bigint;
}

export interface UseExpireServiceRequestTxOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Returns true iff `now > createdAt + grace`. `now` defaults to the system
 * clock; pass an externally-clocked value when you want the gate to advance
 * at the same cadence as the rest of the page (e.g. a `useChainClock` tick).
 */
export const isServiceRequestExpired = (
  createdAt: bigint,
  nowUnixSeconds = BigInt(Math.floor(Date.now() / 1000)),
  graceSeconds = REQUEST_EXPIRY_GRACE_PERIOD_SECONDS,
): boolean => nowUnixSeconds > createdAt + graceSeconds;

/**
 * Returns the seconds remaining until the request can be expired. Negative
 * (or zero) when the request is already eligible for expiry.
 */
export const getServiceRequestExpiryEligibleAt = (
  createdAt: bigint,
  graceSeconds = REQUEST_EXPIRY_GRACE_PERIOD_SECONDS,
): bigint => createdAt + graceSeconds;

export const useExpireServiceRequestTx = (
  options?: UseExpireServiceRequestTxOptions,
) => {
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const hook = useContractWrite(
    TangleABI,
    (params: ExpireServiceRequestParams) => {
      let contracts: ReturnType<typeof getContractsByChainId>;
      try {
        contracts = getContractsByChainId(chainId);
      } catch {
        throw new Error('Tangle contract not available on this network');
      }

      return {
        address: contracts.tangle,
        abi: TangleABI,
        functionName: 'expireServiceRequest' as const,
        args: [params.requestId] as const,
      };
    },
    {
      txName: 'expire service request',
      txDetails: (params) =>
        new Map([['Request ID', params.requestId.toString()]]),
      getSuccessMessage: (params) =>
        `Service request #${params.requestId} expired and refunded.`,
      onSuccess: () => {
        // The expire path flips `req.rejected = true` and refunds escrow, so
        // anything that reads the request, the surrounding service, or the
        // requester's balance must refetch.
        queryClient.invalidateQueries({ queryKey: ['serviceRequestDetails'] });
        queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
        queryClient.invalidateQueries({ queryKey: ['services'] });
        options?.onSuccess?.();
      },
      onError: options?.onError,
    },
  );

  return {
    execute: hook.execute,
    status: hook.status,
    error: hook.error,
    reset: hook.reset,
    txHash: hook.txHash,
    isSuccess: hook.isSuccess,
    isPending: hook.isLoading,
  };
};

export default useExpireServiceRequestTx;
