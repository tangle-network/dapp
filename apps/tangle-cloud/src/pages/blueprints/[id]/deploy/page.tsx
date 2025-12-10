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
} from '../../../../utils/validations/deployBlueprint';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import {
  useBlueprintDetails,
  useServiceRequestTx,
  encodeServiceConfig,
  type ServiceRequestParams,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { Deployment } from './DeploySteps/Deployment';
import { twMerge } from 'tailwind-merge';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import ErrorMessage from '../../../../components/ErrorMessage';
import { z } from 'zod';
import { PagePath } from '../../../../types';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { Address, zeroAddress } from 'viem';

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
    status: serviceRequestStatus,
    isSuccess: serviceRequestSuccess,
    isPending: serviceRequestPending,
  } = useServiceRequestTx();

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
    }),
    [
      blueprintResult?.details,
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
      const operators = validatedData.operators?.map((op) => op.address as Address) ?? [];
      const permittedCallers = validatedData.permittedCallers?.map((c) => c as Address) ?? [];
      const ttl = BigInt(validatedData.ttl ?? 0);

      // Get payment configuration
      const paymentToken = (validatedData.paymentAsset ?? zeroAddress) as Address;
      const paymentAmount = BigInt(validatedData.paymentValue ?? 0);

      // Encode service configuration from request args
      const config = encodeServiceConfig(validatedData.requestArgs ?? []);

      const params: ServiceRequestParams = {
        blueprintId: id ?? 0n,
        operators,
        config,
        permittedCallers,
        ttl,
        paymentToken,
        paymentAmount,
      };

      await serviceRequestTx(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          setError(err.path[0] as keyof DeployBlueprintSchema, {
            type: 'manual',
            message: err.message,
          });
        });
      } else if (error instanceof Error) {
        setError('requestArgs', {
          type: 'manual',
          message: error.message,
        });
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
        <Button
          rightIcon={<ArrowRightIcon width={24} height={24} />}
          onClick={onDeployBlueprint}
          isLoading={serviceRequestPending}
        >
          Deploy
        </Button>
      </div>
    </>
  );
};

export default DeployPage;
