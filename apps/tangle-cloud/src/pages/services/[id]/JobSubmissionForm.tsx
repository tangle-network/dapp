/**
 * Form for submitting jobs to a service.
 * Handles payment display, balance validation, ERC20 approval,
 * and schema-driven dynamic form fields with proper TLV v2 encoding.
 */

import {
  type ComponentProps,
  type ElementType,
  type FC,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  Button as SandboxButton,
  Input as SandboxInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@tangle-network/sandbox-ui/primitives';
import { useSubmitJobTx } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useServiceDetails,
  useServiceEscrow,
  useTokenMetadata,
  ServicePricingModel,
  getServicePricingModelLabel,
  useBlueprintConfig,
  useBlueprintJobs,
} from '@tangle-network/tangle-shared-ui/data/services';
import useErc20Approval from '@tangle-network/tangle-shared-ui/hooks/useErc20Approval';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import {
  BlueprintFieldKind,
  encodePayload,
  getDefaultValue,
  type FormFieldValue,
  type SchemaField,
} from '@tangle-network/tangle-shared-ui/codec';
import { type Hex, formatUnits, isAddress, zeroAddress } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { SchemaFieldInput } from './SchemaFieldInput';

interface Props {
  serviceId: bigint;
  blueprint: Blueprint;
}

type TextProps = ComponentProps<'p'> & {
  variant?: 'body2' | 'body3';
};

const Text: FC<TextProps> = ({
  variant = 'body2',
  className = '',
  ...props
}) => {
  const Component = 'p' as ElementType;
  const variantClass =
    variant === 'body3'
      ? 'text-xs text-muted-foreground'
      : 'text-sm text-foreground';

  return (
    <Component
      className={[variantClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
};

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  />
);

type InputProps = Omit<ComponentProps<typeof SandboxInput>, 'onChange'> & {
  isControlled?: boolean;
  onChange?: (value: string) => void;
};

const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  onChange,
  ...props
}) => (
  <SandboxInput
    {...props}
    onChange={(event) => onChange?.(event.currentTarget.value)}
  />
);

const bytesToHex = (bytes: Uint8Array): Hex => {
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}` as Hex;
};

const validateAddressField = (
  field: SchemaField,
  value: FormFieldValue,
  path: string,
): string | null => {
  if (field.kind === BlueprintFieldKind.Address) {
    if (typeof value !== 'string') {
      return `Invalid EVM address for "${path}"`;
    }

    const normalized = value.trim();
    if (!isAddress(normalized)) {
      return `Invalid EVM address for "${path}"`;
    }
    return null;
  }

  if (field.kind === BlueprintFieldKind.Optional) {
    const child = field.children[0];
    if (!child) {
      return null;
    }

    const optionalValue =
      (value as { present?: boolean; inner?: FormFieldValue } | null) ?? null;

    if (!optionalValue?.present) {
      return null;
    }

    return validateAddressField(
      child,
      optionalValue.inner ?? null,
      `${path}.value`,
    );
  }

  if (
    field.kind === BlueprintFieldKind.Array ||
    field.kind === BlueprintFieldKind.List
  ) {
    const child = field.children[0];
    if (!child || !Array.isArray(value)) {
      return null;
    }

    const expectedLength =
      field.kind === BlueprintFieldKind.Array
        ? field.arrayLength
        : value.length;
    for (let i = 0; i < expectedLength; i++) {
      const validationError = validateAddressField(
        child,
        value[i] ?? null,
        `${path}[${i}]`,
      );
      if (validationError) {
        return validationError;
      }
    }
    return null;
  }

  if (field.kind === BlueprintFieldKind.Struct) {
    const structValues = Array.isArray(value) ? value : [];
    for (let i = 0; i < field.children.length; i++) {
      const child = field.children[i];
      const childPath = `${path}.${child.name || i}`;
      const validationError = validateAddressField(
        child,
        structValues[i] ?? null,
        childPath,
      );
      if (validationError) {
        return validationError;
      }
    }
  }

  return null;
};

const validateAddressInputs = (
  schema: SchemaField[],
  values: FormFieldValue[],
): string | null => {
  for (let i = 0; i < schema.length; i++) {
    const field = schema[i];
    const fieldPath = field.name || `field_${i}`;
    const validationError = validateAddressField(
      field,
      values[i] ?? null,
      fieldPath,
    );
    if (validationError) {
      return validationError;
    }
  }

  return null;
};

export const JobSubmissionForm: FC<Props> = ({ serviceId, blueprint }) => {
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | ''>(0);
  const [inputJson, setInputJson] = useState<string>('');
  const [useRawJson, setUseRawJson] = useState(false);
  const [formValues, setFormValues] = useState<FormFieldValue[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();
  const { submitJob, status, error, reset } = useSubmitJobTx();

  // Get contract address for approval
  const contracts = useMemo(() => {
    if (!chainId) {
      return null;
    }

    try {
      return getContractsByChainId(chainId);
    } catch (contractError) {
      console.error('Failed to resolve contracts by chain ID', {
        chainId,
        error: contractError,
      });
      return null;
    }
  }, [chainId]);

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

  // Fetch job definitions from the contract
  const { data: jobDefinitions, isLoading: isLoadingJobs } = useBlueprintJobs(
    blueprint.id !== undefined ? BigInt(blueprint.id) : undefined,
  );

  // Get the current selected job's parsed schema
  const selectedSchema = useMemo(() => {
    if (
      selectedJobIndex === '' ||
      !jobDefinitions ||
      selectedJobIndex >= jobDefinitions.length
    ) {
      return [];
    }
    return jobDefinitions[selectedJobIndex]?.parsedParamsSchema ?? [];
  }, [selectedJobIndex, jobDefinitions]);

  const hasSchema = selectedSchema.length > 0;

  // Initialize form values when schema changes
  useEffect(() => {
    if (hasSchema) {
      setFormValues(selectedSchema.map(getDefaultValue));
    }
  }, [hasSchema, selectedSchema]);

  const handleFormValueChange = useCallback(
    (index: number, value: FormFieldValue) => {
      setFormValues((prev) => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      });
      setValidationError(null);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setValidationError(null);

    if (selectedJobIndex === '') {
      setValidationError('Please enter a job index');
      return;
    }

    if (
      jobDefinitions &&
      jobDefinitions.length > 0 &&
      selectedJobIndex >= jobDefinitions.length
    ) {
      setValidationError(
        `Invalid job index. This blueprint has ${jobDefinitions.length} job(s) (valid indices: 0\u2013${jobDefinitions.length - 1})`,
      );
      return;
    }

    if (selectedJobIndex < 0 || selectedJobIndex > 255) {
      setValidationError('Job index must be between 0 and 255');
      return;
    }

    let encodedInputs: Hex;

    if (hasSchema && !useRawJson) {
      const addressValidationError = validateAddressInputs(
        selectedSchema,
        formValues,
      );
      if (addressValidationError) {
        setValidationError(addressValidationError);
        return;
      }

      // Encode using TLV v2 schema codec
      try {
        const encoded = encodePayload(selectedSchema, formValues);
        encodedInputs = bytesToHex(encoded);
      } catch (e) {
        setValidationError(
          `Failed to encode inputs: ${e instanceof Error ? e.message : String(e)}`,
        );
        return;
      }
    } else {
      // Fallback: encode as UTF-8 JSON bytes
      let parsedInputs: unknown;
      try {
        parsedInputs = inputJson.trim() ? JSON.parse(inputJson) : [];
      } catch {
        setValidationError('Invalid JSON format');
        return;
      }

      try {
        const jsonString = JSON.stringify(parsedInputs);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(jsonString);
        encodedInputs = bytesToHex(bytes);
      } catch {
        setValidationError('Failed to encode inputs');
        return;
      }
    }

    if (!submitJob) {
      setValidationError('Wallet not connected');
      return;
    }

    await submitJob({
      serviceId,
      jobIndex: selectedJobIndex,
      inputs: encodedInputs,
      value: paymentInfo?.isNativeToken ? paymentInfo.amount : undefined,
    });
  }, [
    serviceId,
    selectedJobIndex,
    inputJson,
    submitJob,
    paymentInfo,
    jobDefinitions,
    hasSchema,
    useRawJson,
    selectedSchema,
    formValues,
  ]);

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
        <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
          <Text variant="body2" className="text-primary">
            <strong>Payment Required:</strong> This service uses per-job
            pricing. Each job costs{' '}
            <span className="font-mono">
              {paymentInfo.formattedAmount} {paymentInfo.tokenSymbol}
            </span>
          </Text>
        </div>
      )}

      {/* Insufficient Balance Warning */}
      {insufficientBalance && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <Text variant="body2" className="text-red-400">
            <strong>Insufficient Balance:</strong> You need at least{' '}
            {paymentInfo?.formattedAmount} {paymentInfo?.tokenSymbol} to submit
            this job.
          </Text>
        </div>
      )}

      {/* ERC20 Approval Section */}
      {paymentInfo &&
        !paymentInfo.isNativeToken &&
        needsApproval &&
        !approvalSuccess && (
          <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <Text variant="body2" className="text-yellow-400 mb-2">
              <strong>Approval Required:</strong> You need to approve the
              contract to spend your tokens before submitting jobs.
            </Text>

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
          <Text variant="body2" className="text-green-400">
            Token approved! You can now submit jobs.
          </Text>
        </div>
      )}

      {/* Pricing Model Info */}
      {serviceDetails && (
        <div className="text-sm text-muted-foreground">
          Pricing: {getServicePricingModelLabel(serviceDetails.pricing)}
        </div>
      )}

      {/* Job Selection */}
      {isLoadingJobs ? (
        <div>
          <Text variant="body2" className="mb-2">
            Select Job
          </Text>

          <Skeleton className="h-10 rounded-lg" />
        </div>
      ) : jobDefinitions && jobDefinitions.length > 0 ? (
        <div>
          <Text variant="body2" className="mb-2">
            Select Job
          </Text>

          <Select
            value={
              selectedJobIndex === '' ? undefined : selectedJobIndex.toString()
            }
            onValueChange={(v) => {
              setSelectedJobIndex(Number(v));
              setUseRawJson(false);
              setInputJson('');
              setValidationError(null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>

            <SelectContent>
              {jobDefinitions.map((job, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Job {index}: {job.name || `Unnamed Job`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedJobIndex !== '' &&
            jobDefinitions[selectedJobIndex]?.description && (
              <Text variant="body3" className="text-muted-foreground mt-1">
                {jobDefinitions[selectedJobIndex].description}
              </Text>
            )}
        </div>
      ) : (
        <div>
          <Text variant="body2" className="mb-2">
            Job Index
          </Text>

          <Input
            id="job-index"
            type="number"
            min={0}
            max={255}
            isControlled
            value={selectedJobIndex === '' ? '' : selectedJobIndex.toString()}
            onChange={(v) => setSelectedJobIndex(v === '' ? '' : Number(v))}
            placeholder="Enter job index (0-255)"
          />
        </div>
      )}

      {/* Job Inputs - Schema-driven or JSON fallback */}
      <div>
        {hasSchema && !useRawJson ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <Text variant="body2">Job Inputs</Text>

              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground underline"
                onClick={() => setUseRawJson(true)}
              >
                Advanced: Raw JSON
              </button>
            </div>

            <div className="space-y-2 p-3 rounded-lg border border-border">
              {selectedSchema.map((field, i) => (
                <SchemaFieldInput
                  key={`${selectedJobIndex}-${i}`}
                  field={field}
                  value={formValues[i] ?? getDefaultValue(field)}
                  onChange={(v) => handleFormValueChange(i, v)}
                  path={field.name || `field_${i}`}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <Text variant="body2">Job Inputs (JSON)</Text>

              {hasSchema && useRawJson && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => setUseRawJson(false)}
                >
                  Use Form Fields
                </button>
              )}
            </div>

            <Textarea
              className="w-full h-32 p-3 rounded-lg border border-border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder='Enter job inputs as JSON array, e.g., ["arg1", 123]'
              value={inputJson}
              onChange={(e) => {
                setInputJson(e.target.value);
                setValidationError(null);
              }}
            />

            <Text variant="body3" className="text-muted-foreground mt-1">
              Enter the arguments for this job as a JSON array
            </Text>
          </>
        )}
      </div>

      {/* Errors */}
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}

      {/* Success Message */}
      {isSuccess && (
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
          <Text variant="body2">
            Job submitted successfully! Results will appear in the history
            below.
          </Text>
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
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              setSelectedJobIndex('');
              setInputJson('');
              setFormValues([]);
              setUseRawJson(false);
              setValidationError(null);
            }}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobSubmissionForm;
