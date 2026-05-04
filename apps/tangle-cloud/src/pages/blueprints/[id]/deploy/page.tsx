import { FC, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Skeleton,
  Text,
} from '../../../../components/sandbox/SandboxUi';
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
    return <Skeleton className="min-h-64" />;
  } else if (blueprintError) {
    return (
      <Card className="p-6">
        <Text variant="h5">Unable to load blueprint</Text>
        <Text variant="body2" className="mt-2 text-muted-foreground">
          {blueprintError.name}
        </Text>
      </Card>
    );
  } else if (blueprintResult === null) {
    return null;
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

  return (
    <RequireWallet
      title="Connect wallet to create an instance"
      description="Connect to review operators, payment, permitted callers, and the service request transaction before anything is submitted."
      eyebrow="Instance checkout"
      checks={['Review operators', 'Confirm payment', 'Submit request']}
    >
      <div className="space-y-5">
        <Card className="overflow-hidden border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Service instance
              </p>
              <Text variant="h4" className="mt-2 text-foreground">
                Create an instance of {blueprintResult.details.name}
              </Text>
              <Text
                variant="body2"
                className="mt-2 max-w-3xl text-muted-foreground"
              >
                Create a running service from this blueprint. The checkout keeps
                the commitment explicit: operators, request arguments, payment,
                permitted callers, and TTL are reviewed before the wallet
                transaction.
              </Text>
            </div>

            <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-3 md:min-w-[420px]">
              <CheckoutMetric label="Blueprint" value={id?.toString() ?? '-'} />
              <CheckoutMetric
                label="Operators"
                value={(blueprintResult.operators?.length ?? 0).toString()}
              />
              <CheckoutMetric
                label="Schema"
                value={
                  requestSchema?.hasRequestSchema
                    ? `${requestSchema.parsedRequestSchema.length} args`
                    : 'No args'
                }
              />
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Review before wallet approval
              </p>
              <Text variant="body2" className="mt-2 text-muted-foreground">
                Shielded credits keep service creation payment-neutral on-chain
                until credit spend is attached to the resulting service or job
                record. Token payment remains available when selected.
              </Text>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CheckoutMetric
                label="Default payment"
                value="Shielded credits"
              />
              <CheckoutMetric label="Default caller" value="Your wallet" />
            </div>
          </div>
        </Card>

        <Deployment {...commonProps} />

        <div className="flex items-center justify-end gap-5 mt-4">
          {Object.keys(errors).length > 0 && (
            <ErrorMessage>
              Error(s) on validation. Please check the form and try again.
            </ErrorMessage>
          )}
          <Button onClick={onDeployBlueprint} isLoading={serviceRequestPending}>
            Create instance
          </Button>
        </div>
      </div>
    </RequireWallet>
  );
};

export default DeployPage;

const CheckoutMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border bg-muted/30 p-3">
    <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 truncate font-mono text-sm text-foreground">{value}</p>
  </div>
);
