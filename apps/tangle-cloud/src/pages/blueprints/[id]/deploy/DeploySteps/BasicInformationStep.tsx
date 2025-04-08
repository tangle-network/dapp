import {
  Label,
  Input,
  IconButton,
  Button,
  Card,
  Typography,
} from '@tangle-network/ui-components';
import InstanceHeader from '../../../../../components/InstanceHeader';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { Children, FC, useCallback } from 'react';
import { BasicInformationStepProps } from './type';
import { TrashIcon } from '@radix-ui/react-icons';

export const BasicInformationStep: FC<BasicInformationStepProps> = ({
  errors,
  setValue,
  watch,
  blueprint,
}) => {
  const labelClassName = 'text-mono-200 dark:text-mono-0 font-medium';

  const values = watch();

  const permittedCallers = values.permittedCallers || [];

  const handleCallerChange = useCallback(
    (index: number, value: string) => {
      const newCallers = [...permittedCallers];
      newCallers[index] = value;
      setValue(`permittedCallers`, newCallers);
    },
    [permittedCallers, setValue],
  );

  const handleRemoveCaller = useCallback(
    (index: number) => {
      const newCallers = permittedCallers.filter((_, idx) => idx !== index);
      setValue(`permittedCallers`, newCallers);
    },
    [permittedCallers, setValue],
  );

  const handleInstanceNameChange = useCallback(
    (value: string) => {
      setValue(`instanceName`, value);
    },
    [setValue],
  );

  const handleInstanceDurationChange = useCallback(
    (value: string) => {
      setValue(`instanceDuration`, parseInt(value));
    },
    [setValue],
  );

  return (
    <>
    <InstanceHeader title={blueprint?.name || ''} creator={blueprint?.author || ''} githubPath={blueprint?.githubUrl || ''}/>
        <Card className="p-6">
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mb-4"
          >
            Basic Information
          </Typography>
          <hr className="border-mono-80 dark:border-mono-160 mb-6" />

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className={labelClassName}>Instance Name</Label>
              <Input
                  id="instanceName"
                  autoFocus
                  isControlled
                  inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
                  placeholder="Enter instance name"
                  autoComplete="off"
                  value={values?.instanceName}
                  onChange={(nextValue) => handleInstanceNameChange(nextValue)}
                />
                {errors?.instanceName && (
                  <ErrorMessage>{errors.instanceName.message}</ErrorMessage>
                )}
            </div>

            <div className="space-y-2">
              <Label className={labelClassName}>Instance Duration</Label>
              <Input
              id="instanceDuration"
              isControlled
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
              placeholder="Enter instance duration"
              autoComplete="off"
              type="number"
              min={1}
              value={values?.instanceDuration?.toString()}
              rightIcon={<>Block(s)</>}
              onChange={(nextValue) => handleInstanceDurationChange(nextValue)}
            />
            {errors?.instanceDuration && (
              <ErrorMessage>{errors.instanceDuration.message}</ErrorMessage>
            )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Label className={labelClassName}>Permitted Callers</Label>
            {errors?.['permittedCallers'] && (
            <ErrorMessage>{errors['permittedCallers'].message}</ErrorMessage>
          )}
          {Children.toArray(
            permittedCallers.map((caller, index) => (
              <div className="pl-4">
                <Label className={labelClassName}>
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
                    placeholder="Enter permitted caller"
                    autoComplete="off"
                  />
                  <IconButton
                    onClick={() => handleRemoveCaller(index)}
                    className="flex-shrink-0"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </IconButton>
                </div>
                {errors?.['permittedCallers']?.[index] && (
                  <ErrorMessage>
                    {errors['permittedCallers'][index].message}
                  </ErrorMessage>
                )}
              </div>
            ))
          )}

          <Button
            onClick={() => {
              setValue(`permittedCallers`, [
                ...permittedCallers,
                '',
              ]);
            }}
            className="mt-4"
          >
            Add Caller
          </Button>
          </div>
          
        </Card>
      </>
  );
};
