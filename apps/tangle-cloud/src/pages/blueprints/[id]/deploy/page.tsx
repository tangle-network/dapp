import { FC, useEffect, useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  DeployBlueprintSchema,
  deployBlueprintSchema,
  toSeconds,
} from '../../../../utils/validations/deployBlueprint';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import {
  useBlueprintDetails,
  useServiceRequestTx,
  encodeServiceConfig,
  validateServiceRequestParams,
  AssetKind,
  PERCENT_TO_BASIS_POINTS,
  type ServiceRequestParams,
  type AssetSecurityRequirement,
  useStakingAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useBlueprintRequestSchema } from '@tangle-network/tangle-shared-ui/data/services';
import { RequestArgsEncodingError } from '@tangle-network/tangle-shared-ui/codec';
import { Deployment } from './DeploySteps/Deployment';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { z } from 'zod';
import { PagePath } from '../../../../types';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { zeroAddress, parseUnits } from 'viem';
import { TxName } from '../../../../constants';
import useTxNotification from '../../../../hooks/useTxNotification';
import { useAccount } from 'wagmi';
import RequireWallet from '../../../../components/RequireWallet';
import TangleCloudCard from '../../../../components/TangleCloudCard';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';

const DeployPage: FC = () => {
  const id = useParamWithSchema('id', z.coerce.bigint());
  const navigate = useNavigate();

  const {
    result: blueprintResult,
    isLoading: isBlueprintLoading,
    error: blueprintError,
  } = useBlueprintDetails(id);

  const {
    execute: serviceRequestTx,
    isSuccess: serviceRequestSuccess,
    isPending: serviceRequestPending,
  } = useServiceRequestTx();
  const { data: requestSchema } = useBlueprintRequestSchema(id);
  const { assets } = useStakingAssets();
  const { address } = useAccount();

  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();

  const {
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<DeployBlueprintSchema>({
    mode: 'onChange',
    // @ts-expect-error Two different types with this name exist, but they are unrelated.
    resolver: zodResolver(deployBlueprintSchema),
    defaultValues: {
      durationUnit: 'hours',
      instanceDuration: 24,
      requestMode: 'basic',
      operatorExposurePercents: {},
      assets: [],
      securityCommitments: [],
      requestArgs: [],
      permittedCallers: [],
      operators: [],
      paymentAmount: '0',
      paymentMethod: 'shieldedCredits',
    },
  });

  const commonProps = useMemo(
    () => ({
      errors,
      setValue,
      watch,
      control,
      setError,
      clearErrors,
      blueprint: blueprintResult?.details,
      blueprintOperators: blueprintResult?.operators,
      requestSchemaFieldCount:
        requestSchema?.parsedRequestSchema.length &&
        requestSchema.parsedRequestSchema.length > 0
          ? requestSchema.parsedRequestSchema.length
          : undefined,
      hasRequestSchema: requestSchema?.hasRequestSchema,
      requestSchemaParseError: requestSchema?.requestSchemaParseError,
    }),
    [
      blueprintResult?.details,
      blueprintResult?.operators,
      control,
      errors,
      setError,
      setValue,
      watch,
      clearErrors,
      requestSchema?.parsedRequestSchema.length,
      requestSchema?.hasRequestSchema,
      requestSchema?.requestSchemaParseError,
    ],
  );

  // Automatically navigate to the blueprint details page when the service
  // request transaction is complete.
  useEffect(() => {
    if (id !== undefined && serviceRequestSuccess) {
      navigate(`${PagePath.BLUEPRINTS_DETAILS}`.replace(':id', id.toString()));
    }
  }, [serviceRequestSuccess, id, navigate]);

  useEffect(() => {
    if (!blueprintResult?.details) {
      return;
    }

    const blueprintName = blueprintResult.details.name?.trim();
    const currentName = getValues('instanceName')?.trim();
    if (!currentName && blueprintName) {
      setValue('instanceName', `${blueprintName} service`, {
        shouldDirty: false,
      });
    }
  }, [blueprintResult?.details, getValues, setValue]);

  useEffect(() => {
    if (!address) {
      return;
    }

    const currentCallers = getValues('permittedCallers') ?? [];
    if (currentCallers.length === 0) {
      setValue('permittedCallers', [address], {
        shouldDirty: false,
      });
    }
  }, [address, getValues, setValue]);

  useEffect(() => {
    const currentOperators = getValues('operators') ?? [];
    const availableOperators =
      blueprintResult?.operators?.map((operator) => operator.address) ?? [];

    if (
      currentOperators.length === 0 &&
      availableOperators.length > 0 &&
      availableOperators.length <= 3
    ) {
      setValue('operators', availableOperators as `0x${string}`[], {
        shouldDirty: false,
      });
    }
  }, [blueprintResult?.operators, getValues, setValue]);

  useEffect(() => {
    const currentPaymentAsset = getValues('paymentAsset');
    if (currentPaymentAsset?.id) {
      return;
    }

    const firstAsset = Array.from(assets?.values() ?? []).find(
      (asset) => asset.metadata.name && asset.metadata.name.trim() !== '',
    );

    if (!firstAsset) {
      return;
    }

    setValue(
      'paymentAsset',
      {
        id: firstAsset.id,
        metadata: {
          name: firstAsset.metadata.name,
          symbol: firstAsset.metadata.symbol,
          decimals: firstAsset.metadata.decimals,
          priceInUsd: null,
        },
      },
      {
        shouldDirty: false,
      },
    );
  }, [assets, getValues, setValue]);

  if (isBlueprintLoading) {
    return (
      <div className="min-h-64 animate-pulse rounded-2xl bg-mono-40 dark:bg-mono-170" />
    );
  } else if (blueprintError) {
    return (
      <TangleCloudCard className="flex flex-col gap-2 p-6">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Unable to load blueprint
        </Typography>
        <Typography variant="body2" className="text-mono-100 dark:text-mono-80">
          {blueprintError.name}
        </Typography>
      </TangleCloudCard>
    );
  } else if (blueprintResult === null) {
    return (
      <TangleCloudCard className="flex flex-col gap-2 p-6">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Blueprint not found
        </Typography>
        <Typography variant="body2" className="text-mono-100 dark:text-mono-80">
          This blueprint is unavailable or has not been indexed yet.
        </Typography>
      </TangleCloudCard>
    );
  }

  const onDeployBlueprint = async () => {
    try {
      clearErrors();
      const formData = getValues();
      const validatedData = deployBlueprintSchema.parse(formData);

      const operators = validatedData.operators ?? [];
      const permittedCallers = validatedData.permittedCallers ?? [];
      const ttlInSeconds =
        validatedData.instanceDuration === 0
          ? 0
          : toSeconds(
              validatedData.instanceDuration,
              validatedData.durationUnit,
            );
      const ttl = BigInt(ttlInSeconds);

      const usesShieldedCredits =
        validatedData.paymentMethod === 'shieldedCredits';
      // Shielded credit checkout currently keeps service creation payment-neutral.
      // Credit spend authorization is tied to the resulting service/job record.
      const paymentToken = usesShieldedCredits
        ? zeroAddress
        : (validatedData.paymentAsset?.id ?? zeroAddress);
      const paymentDecimals =
        validatedData.paymentAsset?.metadata?.decimals ?? 18;
      const paymentAmount = usesShieldedCredits
        ? 0n
        : parseUnits(validatedData.paymentAmount ?? '0', paymentDecimals);

      if (!requestSchema) {
        throw new Error(
          'Request schema is still loading. Please wait and try again.',
        );
      }

      const requestArgs = validatedData.requestArgs ?? [];
      const expectedRequestArgsCount =
        requestSchema.parsedRequestSchema.length > 0
          ? requestSchema.parsedRequestSchema.length
          : (blueprintResult?.details?.requestParams?.length ?? 0);

      if (requestArgs.length !== expectedRequestArgsCount) {
        throw new Error(
          `Request arguments length mismatch: expected ${expectedRequestArgsCount}, got ${requestArgs.length}`,
        );
      }

      if (
        requestSchema.requestSchemaParseError &&
        expectedRequestArgsCount > 0
      ) {
        throw new Error(
          `Failed to parse on-chain request schema: ${requestSchema.requestSchemaParseError}`,
        );
      }

      if (!requestSchema.hasRequestSchema && requestArgs.length > 0) {
        throw new Error(
          'On-chain request schema is unavailable. Non-empty request arguments cannot be encoded for this blueprint.',
        );
      }

      const config = encodeServiceConfig(
        requestArgs,
        requestSchema.hasRequestSchema
          ? requestSchema.parsedRequestSchema
          : undefined,
      );

      let exposureBps: number[] | undefined;
      let securityRequirements: AssetSecurityRequirement[] | undefined;

      if (validatedData.requestMode === 'exposure') {
        const operatorExposurePercents = validatedData.operatorExposurePercents;
        exposureBps = operators.map((operator, index) => {
          const exposurePercent =
            operatorExposurePercents[operator.toLowerCase()];

          if (exposurePercent === undefined) {
            throw new Error(
              `Exposure percent is required for operator #${index + 1}`,
            );
          }

          return exposurePercent * PERCENT_TO_BASIS_POINTS;
        });
      } else if (
        validatedData.requestMode === 'security' &&
        validatedData.assets.length > 0 &&
        validatedData.securityCommitments.length > 0
      ) {
        securityRequirements = validatedData.assets.map((asset, index) => {
          const commitment = validatedData.securityCommitments[index];
          return {
            asset: {
              kind: AssetKind.ERC20,
              token: asset.id,
            },
            minExposureBps:
              (commitment?.minExposurePercent ?? 0) * PERCENT_TO_BASIS_POINTS,
            maxExposureBps:
              (commitment?.maxExposurePercent ?? 100) * PERCENT_TO_BASIS_POINTS,
          };
        });
      }

      const params: ServiceRequestParams = {
        blueprintId: id ?? BigInt(0),
        operators,
        config,
        permittedCallers,
        ttl,
        paymentToken,
        paymentAmount,
        exposureBps,
        securityRequirements,
      };

      validateServiceRequestParams(params);

      notifyProcessing(TxName.DEPLOY_BLUEPRINT);

      const result = await serviceRequestTx(params);

      if (result.error) {
        notifyError(TxName.DEPLOY_BLUEPRINT, result.error);
      } else if (result.txHash) {
        notifySuccess(TxName.DEPLOY_BLUEPRINT);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const errorPath = err.path.join('.') as keyof DeployBlueprintSchema;
          setError(errorPath, {
            type: 'manual',
            message: err.message,
          });
        });
      } else if (
        error instanceof RequestArgsEncodingError ||
        (error instanceof Error &&
          error.message.toLowerCase().includes('request schema'))
      ) {
        setError('requestArgs', {
          type: 'manual',
          message: error.message,
        });
      } else if (error instanceof Error) {
        const normalizedMessage = error.message.toLowerCase();

        if (
          normalizedMessage.includes('exposure') ||
          normalizedMessage.includes('security requirement') ||
          normalizedMessage.includes('mutually exclusive') ||
          normalizedMessage.includes('length mismatch')
        ) {
          const field: keyof DeployBlueprintSchema = normalizedMessage.includes(
            'security requirement',
          )
            ? 'securityCommitments'
            : 'requestMode';

          setError(field, {
            type: 'manual',
            message: error.message,
          });
        }

        notifyError(TxName.DEPLOY_BLUEPRINT, error);
      } else {
        notifyError(
          TxName.DEPLOY_BLUEPRINT,
          error instanceof Error ? error : new Error('Deployment failed'),
        );
      }
    }
  };

  const selectedOperators = watch('operators') ?? [];
  const permittedCallers = watch('permittedCallers') ?? [];
  const paymentMethod = watch('paymentMethod') ?? 'shieldedCredits';
  const paymentAsset = watch('paymentAsset');
  const paymentAmount = watch('paymentAmount') ?? '0';
  const creditCommitment = watch('creditCommitment');
  const requestArgs = watch('requestArgs') ?? [];
  const requestMode = watch('requestMode') ?? 'basic';
  const instanceDuration = watch('instanceDuration');
  const durationUnit = watch('durationUnit') ?? 'hours';
  const hasValidationErrors = Object.keys(errors).length > 0;
  const schemaArgCount =
    requestSchema?.parsedRequestSchema.length ??
    blueprintResult.details.requestParams?.length ??
    0;
  const schemaLabel = requestSchema?.requestSchemaParseError
    ? 'Schema issue'
    : requestSchema?.hasRequestSchema
      ? `${schemaArgCount} arg${schemaArgCount === 1 ? '' : 's'}`
      : schemaArgCount > 0
        ? `${schemaArgCount} expected`
        : 'No args';
  const ttlLabel =
    instanceDuration === 0
      ? 'Perpetual'
      : `${instanceDuration ?? '-'} ${durationUnit}`;
  const paymentLabel =
    paymentMethod === 'shieldedCredits'
      ? creditCommitment
        ? shortAddress(creditCommitment)
        : 'Shielded credits'
      : `${paymentAmount || '0'} ${paymentAsset?.metadata?.symbol ?? 'token'}`;
  const callerLabel =
    permittedCallers.length === 1
      ? shortAddress(permittedCallers[0])
      : `${permittedCallers.length} callers`;

  return (
    <RequireWallet
      title={`Connect wallet to create ${blueprintResult.details.name}`}
      description="Connect to choose operators, set permitted callers, and submit a service request transaction for this blueprint."
      eyebrow="Service instance"
      checks={['Operators', 'Payment', 'Request']}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 space-y-5">
          <TangleCloudCard className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mono-100 dark:text-mono-80">
                Blueprint #{id?.toString() ?? '-'}
              </p>
              <Typography
                variant="h4"
                fw="bold"
                className="mt-2 text-mono-200 dark:text-mono-0"
              >
                {blueprintResult.details.name}
              </Typography>
              <Typography
                variant="body2"
                className="mt-2 max-w-3xl text-mono-120 dark:text-mono-80"
              >
                Configure the service instance, then submit the request from the
                review rail. Operators, caller access, TTL, payment, and request
                args are the only decisions that affect the transaction.
              </Typography>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <CheckoutMetric
                label="Operators"
                value={`${blueprintResult.operators?.length ?? 0} available`}
              />
              <CheckoutMetric label="Schema" value={schemaLabel} />
              <CheckoutMetric label="Default caller" value="Wallet owner" />
            </div>
          </TangleCloudCard>

          <Deployment {...commonProps} />
        </div>

        <aside className="xl:sticky xl:top-4">
          <TangleCloudCard className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mono-100 dark:text-mono-80">
                  Review
                </p>
                <Typography
                  variant="h5"
                  fw="bold"
                  className="mt-1 text-mono-200 dark:text-mono-0"
                >
                  Create instance
                </Typography>
              </div>
              <span className="rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 px-2 py-1 font-mono text-xs text-mono-100 dark:text-mono-80">
                requestService
              </span>
            </div>

            <div className="space-y-1">
              <ReviewRow
                label="Operators"
                value={summaryCount(selectedOperators.length, 'None selected')}
              />
              <ReviewRow label="Callers" value={callerLabel} />
              <ReviewRow label="TTL" value={ttlLabel} />
              <ReviewRow label="Payment" value={paymentLabel} />
              <ReviewRow
                label="Args"
                value={`${requestArgs.length}/${schemaArgCount}`}
              />
              <ReviewRow label="Mode" value={requestMode} />
            </div>

            {hasValidationErrors && (
              <ErrorMessage className="mt-2">
                Check the highlighted fields before submitting.
              </ErrorMessage>
            )}

            <button
              className="w-full rounded-xl bg-purple-40 px-5 py-2.5 text-sm font-bold text-mono-0 transition-colors hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60 disabled:opacity-40"
              onClick={onDeployBlueprint}
              disabled={serviceRequestPending}
            >
              {serviceRequestPending ? 'Creating…' : 'Create instance'}
            </button>
          </TangleCloudCard>
        </aside>
      </div>
    </RequireWallet>
  );
};

export default DeployPage;

const CheckoutMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-mono-100 dark:text-mono-80">
      {label}
    </p>
    <p className="mt-1 truncate font-mono text-sm text-mono-200 dark:text-mono-0">
      {value}
    </p>
  </div>
);

const ReviewRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-b border-mono-60/50 dark:border-mono-170/50 py-2 last:border-0">
    <span className="text-xs text-mono-100 dark:text-mono-80">{label}</span>
    <span className="truncate text-right font-mono text-xs text-mono-200 dark:text-mono-0">
      {value}
    </span>
  </div>
);

const shortAddress = (value: string | undefined) =>
  value && value.length > 14
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : (value ?? '-');

const summaryCount = (count: number, emptyLabel: string) =>
  count > 0 ? `${count}` : emptyLabel;
