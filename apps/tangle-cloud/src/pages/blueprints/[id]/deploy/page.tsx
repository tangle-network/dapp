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
  AssetKind,
  PERCENT_TO_BASIS_POINTS,
  type ServiceRequestParams,
  type AssetSecurityRequirement,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { Deployment } from './DeploySteps/Deployment';
import { twMerge } from 'tailwind-merge';
import ErrorMessage from '../../../../components/ErrorMessage';
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

  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();

  const {
    watch,
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
      instanceDuration: 0,
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
      const validatedData = deployBlueprintSchema.parse(watch());

      // Format the service request data for the Tangle contract
      // Operators are already Address[] from the schema
      const operators = validatedData.operators ?? [];
      const permittedCallers = validatedData.permittedCallers ?? [];
      const ttlInSeconds =
        validatedData.instanceDuration === 0
          ? 0
          : toSeconds(validatedData.instanceDuration, validatedData.durationUnit);
      const ttl = BigInt(ttlInSeconds);

      // Get payment configuration
      const paymentToken = validatedData.paymentAsset?.id ?? zeroAddress;
      const paymentDecimals =
        validatedData.paymentAsset?.metadata?.decimals ?? 18;
      const paymentAmount = parseUnits(
        validatedData.paymentAmount ?? '0',
        paymentDecimals,
      );

      // Encode service configuration from request args
      const config = encodeServiceConfig(validatedData.requestArgs ?? []);

      // Build security requirements from assets and security commitments
      let securityRequirements: AssetSecurityRequirement[] | undefined;
      if (
        validatedData.assets?.length > 0 &&
        validatedData.securityCommitments?.length > 0
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
        securityRequirements,
      };

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
          setError(err.path[0] as keyof DeployBlueprintSchema, {
            type: 'manual',
            message: err.message,
          });
        });
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

      <div
        className={twMerge(
          'p-6 rounded-xl mt-4',
          'flex items-center justify-end gap-5',
          "bg-[url('/static/assets/blueprints/selected-blueprint-panel.png')]",
        )}
      >
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
