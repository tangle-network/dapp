import { FC, useEffect, useMemo } from 'react';
import {
  Button,
  ErrorFallback,
  SkeletonLoader,
} from '@tangle-network/ui-components';
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
      durationUnit: 'seconds',
      requestMode: 'basic',
      operatorExposurePercents: {},
      assets: [],
      securityCommitments: [],
      requestArgs: [],
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

  if (isBlueprintLoading) {
    return <SkeletonLoader className="min-h-64" />;
  } else if (blueprintError) {
    return <ErrorFallback title={blueprintError.name} />;
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

      // Get payment configuration
      const paymentToken = validatedData.paymentAsset?.id ?? zeroAddress;
      const paymentDecimals =
        validatedData.paymentAsset?.metadata?.decimals ?? 18;
      const paymentAmount = parseUnits(
        validatedData.paymentAmount ?? '0',
        paymentDecimals,
      );

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
    <>
      <Deployment {...commonProps} />

      <div className="flex items-center justify-end gap-5 mt-4">
        {Object.keys(errors).length > 0 && (
          <ErrorMessage>
            Error(s) on validation. Please check the form and try again.
          </ErrorMessage>
        )}
        <Button onClick={onDeployBlueprint} isLoading={serviceRequestPending}>
          Deploy
        </Button>
      </div>
    </>
  );
};

export default DeployPage;
