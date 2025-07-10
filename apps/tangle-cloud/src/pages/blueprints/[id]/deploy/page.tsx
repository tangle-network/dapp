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
  formatServiceRegisterData,
} from '../../../../utils/validations/deployBlueprint';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { Deployment } from './DeploySteps/Deployment';
import { twMerge } from 'tailwind-merge';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import ErrorMessage from '../../../../components/ErrorMessage';
import { z } from 'zod';
import useServiceRequestTx from '../../../../data/services/useServicesRequestTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { PagePath } from '../../../../types';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';

const DeployPage: FC = () => {
  const id = useParamWithSchema('id', z.coerce.bigint());
  const navigate = useNavigate();

  const wsRpcEndpoints = useNetworkStore(
    (store) => store.network2?.wsRpcEndpoints,
  );

  const {
    result: blueprintResult,
    isLoading: isBlueprintLoading,
    error: blueprintError,
  } = useBlueprintDetails(id);

  const { execute: serviceRegisterTx, status: serviceRegisterStatus } =
    useServiceRequestTx();

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
    [blueprintResult?.details, control, errors, setError, setValue, watch, clearErrors],
  );

  // Automatically navigate to the blueprint details page when the service
  // register transaction is complete.
  useEffect(() => {
    if (id !== undefined && serviceRegisterStatus === TxStatus.COMPLETE) {
      navigate(`${PagePath.BLUEPRINTS_DETAILS}`.replace(':id', id.toString()));
    }
  }, [serviceRegisterStatus, id, navigate]);

  if (isBlueprintLoading) {
    return <SkeletonLoader className="min-h-64" />;
  } else if (blueprintError) {
    return <ErrorFallback title={blueprintError.name} />;
  } else if (blueprintResult === null) {
    // TODO: Show 404 page
    return null;
  }

  const onDeployBlueprint = async () => {
    try {
      clearErrors();
      const validatedData = deployBlueprintSchema.parse(watch());

      const serviceRegisterData = formatServiceRegisterData(
        blueprintResult.details,
        validatedData,
      );
      if (serviceRegisterTx && wsRpcEndpoints) {
        const apiPromise = await getApiPromise(wsRpcEndpoints);
        await serviceRegisterTx({
          ...serviceRegisterData,
          apiPromise: apiPromise,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          setError(err.path[0] as keyof DeployBlueprintSchema, {
            type: 'manual',
            message: err.message,
          });
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
          isLoading={serviceRegisterStatus === TxStatus.PROCESSING}
        >
          Deploy
        </Button>
      </div>
    </>
  );
};

export default DeployPage;
