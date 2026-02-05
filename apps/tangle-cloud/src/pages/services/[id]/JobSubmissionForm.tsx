/**
 * Form for submitting jobs to a service.
 * Handles payment display, balance validation, and ERC20 approval.
 */

import { FC, useState, useCallback, useMemo } from 'react';
import { Button, Typography, Input } from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { useSubmitJobTx } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useServiceDetails,
  useServiceEscrow,
  useTokenMetadata,
  ServicePricingModel,
  getServicePricingModelLabel,
} from '@tangle-network/tangle-shared-ui/data/services';
import { useBlueprintConfig } from '@tangle-network/tangle-shared-ui/data/services';
import useErc20Approval from '@tangle-network/tangle-shared-ui/hooks/useErc20Approval';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { type Hex, formatUnits, zeroAddress } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import ErrorMessage from '../../../components/ErrorMessage';

interface Props {
  serviceId: bigint;
  blueprint: Blueprint;
}

export const JobSubmissionForm: FC<Props> = ({ serviceId, blueprint }) => {
  const [selectedJobIndex, setSelectedJobIndex] = useState<number>(0);
  const [inputJson, setInputJson] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();
  const { submitJob, status, error, reset } = useSubmitJobTx();

  // Get contract address for approval
  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  // Fetch service details to get pricing model
  const { data: serviceDetails } = useServiceDetails(serviceId);

  // Fetch escrow info to check payment token
  const { data: escrow } = useServiceEscrow(serviceId);

  // Fetch blueprint config for event rate
  const { data: blueprintConfig } = useBlueprintConfig(
    blueprint.id !== undefined ? BigInt(blueprint.id) : undefined,
  );

  // Fetch token metadata for symbol display
  const { data: tokenMetadata } = useTokenMetadata(escrow?.token);

  // Determine payment requirements
  const paymentInfo = useMemo(() => {
    if (!serviceDetails || !blueprintConfig) return null;

    const isEventDriven =
      serviceDetails.pricing === ServicePricingModel.EventDriven;
    if (!isEventDriven) return null;

    const eventRate = blueprintConfig.eventRate;
    const isNativeToken = escrow?.isNativeToken ?? true;
    const token = escrow?.token ?? zeroAddress;
    const tokenSymbol =
      tokenMetadata?.symbol ?? (isNativeToken ? 'ETH' : 'tokens');
    const tokenDecimals = tokenMetadata?.decimals ?? 18;

    return {
      amount: eventRate,
      isNativeToken,
      token,
      tokenSymbol,
      formattedAmount: formatUnits(eventRate, tokenDecimals),
    };
  }, [serviceDetails, blueprintConfig, escrow, tokenMetadata]);

  // Get user's native token balance
  const { data: nativeBalance } = useBalance({
    address,
    query: { enabled: !!address && (paymentInfo?.isNativeToken ?? false) },
  });

  // Get user's ERC20 token balance (if using ERC20)
  const { data: tokenBalance } = useBalance({
    address,
    token:
      paymentInfo?.isNativeToken === false ? paymentInfo?.token : undefined,
    query: { enabled: !!address && paymentInfo?.isNativeToken === false },
  });

  // ERC20 approval handling
  const {
    needsApproval,
    approve,
    isPending: isApproving,
    isSuccess: approvalSuccess,
  } = useErc20Approval({
    token:
      paymentInfo?.isNativeToken === false ? paymentInfo?.token : undefined,
    spender: contracts?.tangle,
    amount: paymentInfo?.amount ?? BigInt(0),
    owner: address,
    enabled: paymentInfo?.isNativeToken === false,
  });

  // Check if user has sufficient balance
  const insufficientBalance = useMemo(() => {
    if (!paymentInfo) return false;

    if (paymentInfo.isNativeToken) {
      return nativeBalance && nativeBalance.value < paymentInfo.amount;
    } else {
      return tokenBalance && tokenBalance.value < paymentInfo.amount;
    }
  }, [paymentInfo, nativeBalance, tokenBalance]);

  // Get job definitions from blueprint
  const jobs = blueprint.requestParams ?? [];

  const handleSubmit = useCallback(async () => {
    setValidationError(null);

    // Validate JSON input
    let parsedInputs: unknown;
    try {
      parsedInputs = inputJson.trim() ? JSON.parse(inputJson) : [];
    } catch {
      setValidationError('Invalid JSON format');
      return;
    }

    // Encode inputs as bytes
    let encodedInputs: Hex;
    try {
      const jsonString = JSON.stringify(parsedInputs);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonString);
      encodedInputs = `0x${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}` as Hex;
    } catch {
      setValidationError('Failed to encode inputs');
      return;
    }

    await submitJob({
      serviceId,
      jobIndex: selectedJobIndex,
      inputs: encodedInputs,
      value: paymentInfo?.isNativeToken ? paymentInfo.amount : undefined,
    });
  }, [serviceId, selectedJobIndex, inputJson, submitJob, paymentInfo]);

  const isSubmitting = status === 'pending';
  const isSuccess = status === 'success';

  // Determine if submit should be disabled
  const isSubmitDisabled =
    isSubmitting ||
    !!insufficientBalance ||
    !!(
      paymentInfo &&
      !paymentInfo.isNativeToken &&
      needsApproval &&
      !approvalSuccess
    );

  return (
    <div className="space-y-4">
      {/* Payment Info Banner */}
      {paymentInfo && (
        <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <Typography variant="body2" className="text-blue-400">
            <strong>Payment Required:</strong> This service uses per-job
            pricing. Each job costs{' '}
            <span className="font-mono">
              {paymentInfo.formattedAmount} {paymentInfo.tokenSymbol}
            </span>
          </Typography>
        </div>
      )}

      {/* Insufficient Balance Warning */}
      {insufficientBalance && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <Typography variant="body2" className="text-red-400">
            <strong>Insufficient Balance:</strong> You need at least{' '}
            {paymentInfo?.formattedAmount} {paymentInfo?.tokenSymbol} to submit
            this job.
          </Typography>
        </div>
      )}

      {/* ERC20 Approval Section */}
      {paymentInfo &&
        !paymentInfo.isNativeToken &&
        needsApproval &&
        !approvalSuccess && (
          <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <Typography variant="body2" className="text-yellow-400 mb-2">
              <strong>Approval Required:</strong> You need to approve the
              contract to spend your tokens before submitting jobs.
            </Typography>

            <Button
              onClick={approve}
              isLoading={isApproving}
              isDisabled={isApproving}
              variant="secondary"
              size="sm"
            >
              {isApproving ? 'Approving...' : 'Approve Token Spending'}
            </Button>
          </div>
        )}

      {/* Approval Success */}
      {paymentInfo && !paymentInfo.isNativeToken && approvalSuccess && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
          <Typography variant="body2" className="text-green-400">
            Token approved! You can now submit jobs.
          </Typography>
        </div>
      )}

      {/* Pricing Model Info */}
      {serviceDetails && (
        <div className="text-sm text-mono-100">
          Pricing: {getServicePricingModelLabel(serviceDetails.pricing)}
        </div>
      )}

      {/* Job Selection */}
      {jobs.length > 0 ? (
        <div>
          <Typography variant="body2" className="mb-2">
            Select Job
          </Typography>

          <Select
            value={selectedJobIndex.toString()}
            onValueChange={(v) => setSelectedJobIndex(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>

            <SelectContent>
              {jobs.map((job, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Job {index}:{' '}
                  {typeof job === 'object' ? JSON.stringify(job) : job}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Typography variant="body2" className="mb-2">
            Job Index
          </Typography>

          <Input
            id="job-index"
            type="number"
            min={0}
            value={selectedJobIndex.toString()}
            onChange={(v) => setSelectedJobIndex(Number(v))}
            placeholder="Enter job index"
          />
        </div>
      )}

      {/* Job Inputs */}
      <div>
        <Typography variant="body2" className="mb-2">
          Job Inputs (JSON)
        </Typography>

        <textarea
          className="w-full h-32 p-3 rounded-lg border border-mono-60 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder='Enter job inputs as JSON array, e.g., ["arg1", 123]'
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setValidationError(null);
          }}
        />

        <Typography variant="body3" className="text-mono-100 mt-1">
          Enter the arguments for this job as a JSON array
        </Typography>
      </div>

      {/* Errors */}
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}

      {/* Success Message */}
      {isSuccess && (
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
          <Typography variant="body2">
            Job submitted successfully! Results will appear in the history
            below.
          </Typography>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitDisabled}
        >
          {isSubmitting
            ? 'Submitting...'
            : insufficientBalance
              ? 'Insufficient Balance'
              : paymentInfo
                ? `Submit Job (${paymentInfo.formattedAmount} ${paymentInfo.tokenSymbol})`
                : 'Submit Job'}
        </Button>

        {(isSuccess || error) && (
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobSubmissionForm;
