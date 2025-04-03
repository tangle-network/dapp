import { createElement, FC, useMemo, useState } from 'react';
import InfoSidebar from '../../../../components/InfoSidebar';
import {
  Button,
  ErrorFallback,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { DeployStep1 } from './DeploySteps/DeployStep1';
import { useForm } from 'react-hook-form';
import {
  BLUEPRINT_DEPLOY_STEPS,
  DeployBlueprintSchema,
  deployBlueprintSchema,
} from '../../../../utils/validations/deployBlueprint';
import { zodResolver } from '@hookform/resolvers/zod';
import { twMerge } from 'tailwind-merge';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useParams } from 'react-router';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';

const DeployPage: FC = () => {
  const { id } = useParams();
  const [step, setStep] = useState(0);
  const {
    result: blueprintResult,
    isLoading: isBlueprintLoading,
    error: blueprintError,
  } = useBlueprintDetails(id);

  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DeployBlueprintSchema>({
    mode: 'onChange',
    resolver: zodResolver(deployBlueprintSchema),
  });

  const commonProps = {
    errors,
    setValue,
    watch,
    blueprint: blueprintResult?.details,
  };

  const steps = useMemo(
    () => [
      {
        component: DeployStep1,
        props: commonProps,
      },
    ],
    [errors, setValue, watch, blueprintResult?.details],
  );

  const StepComponent = createElement(steps[step].component, steps[step].props);

  const onNextStep = async () => {
    const values = BLUEPRINT_DEPLOY_STEPS[step];
    const isStepValid = await trigger(values);

    if (isStepValid && step < BLUEPRINT_DEPLOY_STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  if (isBlueprintLoading) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Blueprint details
        </Typography>

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  } else if (blueprintError) {
    return <ErrorFallback title={blueprintError.name} />;
  } else if (blueprintResult === null) {
    // TODO: Show 404 page
    return null;
  }

  return (
    <>
      <div className="flex flex-1 min-h-0">
        <div className="flex w-full">
          <InfoSidebar>
            <Typography variant="h5">Instance Settings</Typography>

            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-100"
            >
              Register to run Blueprints and start earning as you secure and
              execute service instances.
            </Typography>
          </InfoSidebar>

          <div className="flex flex-col flex-1">{StepComponent}</div>
        </div>
      </div>

      <div className="absolute w-[calc(100%-5rem)]">
        <div
          className={twMerge(
            'p-6 rounded-xl mt-4',
            'flex items-center justify-end',
            "bg-[url('/static/assets/blueprints/selected-blueprint-panel.png')]",
          )}
        >
          {step > 1 && (
            <Button rightIcon={<ArrowRightIcon width={24} height={24} />}>
              Back
            </Button>
          )}
          <Button
            rightIcon={<ArrowRightIcon width={24} height={24} />}
            onClick={onNextStep}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default DeployPage;
