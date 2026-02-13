import { zodResolver } from '@hookform/resolvers/zod';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  RegistrationStep,
  registrationFormSchema,
  RegistrationFormSchema,
  TOTAL_STEPS,
} from './types';
import { getMissingRegistrationParamIndices } from './registrationInputs';

type UseRegistrationFormOptions = {
  blueprints: Blueprint[];
  onClose?: () => void;
};

const useRegistrationForm = ({
  blueprints,
  onClose,
}: UseRegistrationFormOptions) => {
  const [step, setStep] = useState<RegistrationStep>(
    RegistrationStep.SELECT_BLUEPRINTS,
  );

  const defaultBlueprintConfigs = useMemo(() => {
    const configs: Record<string, { params: Record<string, unknown> }> = {};
    for (const blueprint of blueprints) {
      configs[blueprint.id.toString()] = {
        params: {},
      };
    }
    return configs;
  }, [blueprints]);

  const form = useForm<RegistrationFormSchema>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      rpcUrl: '',
      blueprintConfigs: defaultBlueprintConfigs,
    },
    mode: 'onChange',
  });

  // Sync blueprintConfigs when blueprints change (e.g., when removing a blueprint)
  useEffect(() => {
    const currentConfigs = form.getValues('blueprintConfigs');
    const updatedConfigs: Record<string, { params: Record<string, unknown> }> =
      {};

    for (const blueprint of blueprints) {
      const blueprintId = blueprint.id.toString();
      updatedConfigs[blueprintId] = currentConfigs[blueprintId] || {
        params: {},
      };
    }

    form.setValue('blueprintConfigs', updatedConfigs);
  }, [blueprints, form]);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    switch (step) {
      case RegistrationStep.SELECT_BLUEPRINTS:
        return blueprints.length > 0;

      case RegistrationStep.CONFIGURE: {
        // RPC URL is required for operator registration
        const rpcUrlResult = await form.trigger('rpcUrl');
        if (!rpcUrlResult) {
          return false;
        }

        const blueprintConfigs = form.getValues('blueprintConfigs');
        const invalidBlueprints: string[] = [];

        for (const blueprint of blueprints) {
          const config = blueprintConfigs[blueprint.id.toString()];
          const missingParamIndices = getMissingRegistrationParamIndices(
            blueprint.registrationParams,
            config?.params ?? {},
          );

          if (missingParamIndices.length > 0) {
            invalidBlueprints.push(
              `${blueprint.name}: ${missingParamIndices
                .map((index) => `#${index + 1}`)
                .join(', ')}`,
            );
          }
        }

        if (invalidBlueprints.length > 0) {
          form.setError('blueprintConfigs', {
            type: 'manual',
            message: `Complete required params for: ${invalidBlueprints.join('; ')}`,
          });
          return false;
        }

        form.clearErrors('blueprintConfigs');
        return true;
      }

      case RegistrationStep.REVIEW:
        return true;

      default:
        return false;
    }
  }, [step, blueprints, form]);

  const goNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      return false;
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => (prev + 1) as RegistrationStep);
      return true;
    }
    return false;
  }, [step, validateCurrentStep]);

  const goBack = useCallback(() => {
    if (step > RegistrationStep.SELECT_BLUEPRINTS) {
      setStep((prev) => (prev - 1) as RegistrationStep);
      return true;
    }
    return false;
  }, [step]);

  const reset = useCallback(() => {
    setStep(RegistrationStep.SELECT_BLUEPRINTS);
    form.reset({
      rpcUrl: '',
      blueprintConfigs: defaultBlueprintConfigs,
    });
    onClose?.();
  }, [form, defaultBlueprintConfigs, onClose]);

  const isFirstStep = step === RegistrationStep.SELECT_BLUEPRINTS;
  const isLastStep = step === RegistrationStep.REVIEW;

  return {
    form,
    step,
    setStep,
    goNext,
    goBack,
    reset,
    validateCurrentStep,
    isFirstStep,
    isLastStep,
  };
};

export default useRegistrationForm;
