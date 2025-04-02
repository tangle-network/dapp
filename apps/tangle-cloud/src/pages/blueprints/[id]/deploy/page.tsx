import { createElement, FC, useMemo, useState } from 'react';
import {
  Button,
  ErrorFallback,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import { BasicInformationStep } from './DeploySteps/BasicInformationStep';
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
import { SelectOperatorsStep } from './DeploySteps/OperatorSelectionStep';
import { ArrowLeft } from '@tangle-network/icons';

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
        component: BasicInformationStep,
        props: commonProps,
      },
      {
        component: SelectOperatorsStep,
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

  const onBackStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (isBlueprintLoading) {
    return <SkeletonLoader className="min-h-64" />;
  } else if (blueprintError) {
    return <ErrorFallback title={blueprintError.name} />;
  } else if (blueprintResult === null) {
    // TODO: Show 404 page
    return null;
  }

  return (
    <>
      {StepComponent}

      <div className="absolute w-[calc(100%-5rem)]">
        <div
          className={twMerge(
            'p-6 rounded-xl mt-4',
            'flex items-center justify-end gap-5',
            "bg-[url('/static/assets/blueprints/selected-blueprint-panel.png')]",
          )}
        >
          {step > 0 && (
            <Button
              variant="secondary"
              onClick={onBackStep}
              leftIcon={<ArrowLeft width={24} height={24} />}
            >
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
