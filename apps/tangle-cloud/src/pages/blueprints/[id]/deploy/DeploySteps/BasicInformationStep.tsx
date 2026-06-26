import {
  Input,
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '../../../../../components/sandbox/SandboxUi';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { Children, FC, useMemo } from 'react';
import { BasicInformationStepProps, LabelClassName } from './type';
import { TrashIcon, PlusIcon } from '@radix-ui/react-icons';
import type { Address } from 'viem';
import {
  DURATION_UNITS,
  DurationUnit,
  getDurationConstraints,
} from '../../../../../utils/validations/deployBlueprint';

export const BasicInformationStep: FC<BasicInformationStepProps> = ({
  errors,
  setValue,
  watch,
  setError,
  clearErrors,
}) => {
  const permittedCallers = watch('permittedCallers');
  const instanceName = watch('instanceName');
  const instanceDuration = watch('instanceDuration');
  const durationUnit = watch('durationUnit') ?? 'seconds';

  const constraints = useMemo(
    () => getDurationConstraints(durationUnit),
    [durationUnit],
  );

  const immediateDurationError = useMemo(() => {
    if (typeof instanceDuration !== 'number') {
      return undefined;
    }

    if (instanceDuration === 0) {
      return undefined;
    }

    const unitConstraints = getDurationConstraints(durationUnit);
    if (
      instanceDuration < unitConstraints.min ||
      instanceDuration > unitConstraints.max
    ) {
      return `Duration must be 0 (perpetual) or between ${unitConstraints.min} and ${unitConstraints.max} ${durationUnit}`;
    }

    return undefined;
  }, [durationUnit, instanceDuration]);

  const instanceDurationError =
    immediateDurationError ?? errors?.instanceDuration?.message;

  const validateInstanceDuration = (value: number, unit: DurationUnit) => {
    if (value === 0) {
      clearErrors('instanceDuration');
      return;
    }

    const unitConstraints = getDurationConstraints(unit);
    if (value < unitConstraints.min || value > unitConstraints.max) {
      setError('instanceDuration', {
        type: 'manual',
        message: `Duration must be 0 (perpetual) or between ${unitConstraints.min} and ${unitConstraints.max} ${unit}`,
      });
      return;
    }

    clearErrors('instanceDuration');
  };

  const handleCallerChange = (index: number, value: string) => {
    const newCallers = [...permittedCallers];
    newCallers[index] = value as Address;
    setValue(`permittedCallers`, newCallers);
  };

  const handleRemoveCaller = (index: number) => {
    const newCallers = permittedCallers.filter((_, idx) => idx !== index);
    setValue(`permittedCallers`, newCallers);
  };

  const handleInstanceNameChange = (value: string) => {
    setValue(`instanceName`, value);
  };

  const handleInstanceDurationChange = (value: string) => {
    if (value === '') {
      setValue('instanceDuration', undefined as unknown as number, {
        shouldDirty: true,
        shouldValidate: false,
      });
      clearErrors('instanceDuration');
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setValue('instanceDuration', numValue, {
        shouldDirty: true,
        shouldValidate: true,
      });
      validateInstanceDuration(numValue, durationUnit);
    }
  };

  const handleDurationUnitChange = (unit: DurationUnit) => {
    setValue('durationUnit', unit, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (typeof instanceDuration === 'number') {
      validateInstanceDuration(instanceDuration, unit);
    }
  };

  return (
    <Card className="p-5">
      <Text variant="h5" className="mb-4">
        Instance
      </Text>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className={LabelClassName}>Instance Name</label>
          <Input
            id="instanceName"
            autoFocus
            isControlled
            inputClassName="placeholder:text-mono-100 dark:text-mono-80 h-10"
            placeholder="Enter instance name"
            autoComplete="off"
            value={instanceName}
            onChange={(nextValue) => handleInstanceNameChange(nextValue)}
          />
          {errors?.instanceName && (
            <ErrorMessage>{errors.instanceName.message}</ErrorMessage>
          )}
        </div>

        <div className="space-y-2">
          <label className={LabelClassName}>Instance Duration (TTL)</label>
          <div className="flex gap-2">
            <Input
              id="instanceDuration"
              isControlled
              isInvalid={Boolean(instanceDurationError)}
              inputClassName="placeholder:text-mono-100 dark:text-mono-80 h-10"
              placeholder="Enter duration"
              autoComplete="off"
              type="number"
              min={0}
              max={constraints.max}
              value={instanceDuration?.toString() ?? ''}
              onChange={(nextValue) => handleInstanceDurationChange(nextValue)}
              className="flex-1"
            />

            <Select
              value={durationUnit}
              onValueChange={handleDurationUnitChange}
            >
              <SelectTrigger className="w-28 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DURATION_UNITS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Text variant="body2" className="text-mono-100 dark:text-mono-80">
            Use 0 for perpetual service, or {constraints.min}-{constraints.max}{' '}
            {durationUnit}
          </Text>
          {instanceDurationError && (
            <ErrorMessage>{instanceDurationError}</ErrorMessage>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className={LabelClassName}>Permitted Callers</label>
        {errors?.['permittedCallers'] && (
          <ErrorMessage>{errors['permittedCallers'].message}</ErrorMessage>
        )}
        {Children.toArray(
          permittedCallers?.map((caller, index) => (
            <div>
              <label className={LabelClassName}>Caller {index + 1}</label>
              <div className="flex gap-2">
                <Input
                  id={`permittedCallers-${index}`}
                  value={caller}
                  isControlled
                  onChange={(nextValue) => handleCallerChange(index, nextValue)}
                  className="flex-grow"
                  inputClassName="placeholder:text-mono-100 dark:text-mono-80 h-10 w-full"
                  placeholder="Enter wallet address (0x...)"
                  autoComplete="off"
                />
                <Button
                  onClick={() => handleRemoveCaller(index)}
                  className="flex-shrink-0"
                  variant="utility"
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </div>
              {errors?.['permittedCallers']?.[index] && (
                <ErrorMessage>
                  {errors['permittedCallers'][index].message}
                </ErrorMessage>
              )}
            </div>
          )),
        )}

        <Button
          variant="utility"
          onClick={() => {
            const newPermittedCaller = permittedCallers ?? [];
            newPermittedCaller.push('' as Address);
            setValue(`permittedCallers`, newPermittedCaller);
          }}
          className="mt-4"
          leftIcon={<PlusIcon />}
        >
          Add Caller
        </Button>
      </div>
    </Card>
  );
};
