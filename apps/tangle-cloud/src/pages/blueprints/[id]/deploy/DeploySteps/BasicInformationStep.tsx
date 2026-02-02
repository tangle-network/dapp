import {
  Label,
  Input,
  Button,
  Card,
  Typography,
} from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import InstanceHeader from '../../../../../components/InstanceHeader';
import ErrorMessage from '../../../../../components/ErrorMessage';
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
  blueprint,
}) => {
  const permittedCallers = watch('permittedCallers');
  const instanceName = watch('instanceName');
  const instanceDuration = watch('instanceDuration');
  const durationUnit = watch('durationUnit') ?? 'hours';

  const constraints = useMemo(
    () => getDurationConstraints(durationUnit),
    [durationUnit],
  );

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
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setValue(`instanceDuration`, isNaN(numValue) ? 0 : numValue);
  };

  const handleDurationUnitChange = (unit: DurationUnit) => {
    setValue('durationUnit', unit);
  };

  return (
    <>
      <InstanceHeader
        title={blueprint?.name}
        creator={blueprint?.author}
        githubPath={blueprint?.githubUrl}
      />
      <Card className="p-6">
        <Typography
          variant="h5"
          className="text-mono-200 dark:text-mono-0 mb-4"
        >
          Basic Information
        </Typography>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className={LabelClassName}>Instance Name</Label>
            <Input
              id="instanceName"
              autoFocus
              isControlled
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
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
            <Label className={LabelClassName}>Instance Duration (TTL)</Label>
            <div className="flex gap-2">
              <Input
                id="instanceDuration"
                isControlled
                inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
                placeholder="Enter duration"
                autoComplete="off"
                type="number"
                min={0}
                value={instanceDuration?.toString() ?? ''}
                onChange={(nextValue) => handleInstanceDurationChange(nextValue)}
                className="flex-1"
              />

              <Select value={durationUnit} onValueChange={handleDurationUnitChange}>
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
            <Typography
              variant="body2"
              className="text-mono-100 dark:text-mono-100"
            >
              Use 0 for perpetual service, or {constraints.min}-{constraints.max}{' '}
              {durationUnit} (1 hour to 365 days)
            </Typography>
            {errors?.instanceDuration && (
              <ErrorMessage>{errors.instanceDuration.message}</ErrorMessage>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Label className={LabelClassName}>Permitted Callers</Label>
          {errors?.['permittedCallers'] && (
            <ErrorMessage>{errors['permittedCallers'].message}</ErrorMessage>
          )}
          {Children.toArray(
            permittedCallers?.map((caller, index) => (
              <div className="pl-4">
                <Label className={LabelClassName}>
                  Permitted Caller {index + 1}:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`permittedCallers-${index}`}
                    value={caller}
                    isControlled
                    onChange={(nextValue) =>
                      handleCallerChange(index, nextValue)
                    }
                    className="flex-grow"
                    inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10 w-full"
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
    </>
  );
};
