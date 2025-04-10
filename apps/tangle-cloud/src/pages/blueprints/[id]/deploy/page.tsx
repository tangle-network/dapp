import { FC } from 'react';
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
import { useParams } from 'react-router';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { Deployment } from './DeploySteps/Deployment';
import { twMerge } from 'tailwind-merge';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import ErrorMessage from '../../../../components/ErrorMessage';
import { z } from 'zod';

const DeployPage: FC = () => {
  const { id } = useParams();

  const {
    result: blueprintResult,
    isLoading: isBlueprintLoading,
    error: blueprintError,
  } = useBlueprintDetails(id);

  const {
    watch,
    setValue,
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<DeployBlueprintSchema>({
    mode: 'onChange',
    resolver: zodResolver(deployBlueprintSchema),
  });

  const commonProps = {
    errors,
    setValue,
    watch,
    control,
    blueprint: blueprintResult?.details,
  };

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
      const validatedData = deployBlueprintSchema.parse(watch());
      // clear errors 
      clearErrors();
      console.log(validatedData);
      console.log('deploy');
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          setError(err.path[0] as keyof DeployBlueprintSchema, {
            type: 'manual',
            message: err.message
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
        {
          Object.keys(errors).length > 0 && (
            <ErrorMessage>
              Error(s) on validation. Please check the form and try again.
            </ErrorMessage>
          )
        }
        <Button
          rightIcon={<ArrowRightIcon width={24} height={24} />}
          onClick={onDeployBlueprint}
        >
          Deploy
        </Button>
      </div>
    </>
  );
};

export default DeployPage;
