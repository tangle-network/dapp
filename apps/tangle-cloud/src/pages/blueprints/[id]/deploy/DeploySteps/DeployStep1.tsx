import { Label, Input, IconButton, Button } from '@tangle-network/ui-components';
import InstanceHeader from '../../../../../components/InstanceHeader';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { Children, FC } from 'react';
import { DeployStep1Props } from './type';
import { TrashIcon } from '@radix-ui/react-icons';
import { BLUEPRINT_DEPLOY_STEPS } from '../../../../../utils/validations/deployBlueprint';
import { SubstrateAddress, EvmAddress } from '@tangle-network/ui-components/types/address';
export const DeployStep1: FC<DeployStep1Props> = ({ 
  errors: globalErrors,
  setValue,
  watch,
}) => {
  const labelClassName = 'text-mono-200 dark:text-mono-0';

  const stepKey = BLUEPRINT_DEPLOY_STEPS[0];
  const values = watch(stepKey);

  const errors = globalErrors?.[stepKey];
  const permittedCallers = values?.permittedCallers || [];

  const handleCallerChange = (index: number, value: string) => {
    const newCallers = [...permittedCallers];
    newCallers[index] = value as SubstrateAddress | EvmAddress;
    setValue(`${stepKey}.permittedCallers`, newCallers);
  };

  const handleRemoveCaller = (index: number) => {
    const newCallers = permittedCallers.filter((_, idx) => idx !== index);
    setValue(`${stepKey}.permittedCallers`, newCallers);
  };

  const handleInstanceNameChange = (value: string) => {
    setValue(`${stepKey}.instanceName`, value);
  };

  const handleInstanceDurationChange = (value: string) => {
    setValue(`${stepKey}.instanceDuration`, parseInt(value));
  };

  console.log(errors);
  

  return (
    <div className="w-full pl-8">
      <InstanceHeader title="DFNS CGGMP21" creator="Tangle Network" />

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <Label className={labelClassName}>Instance Name:</Label>
          <Input
            id="instanceName"
            isControlled
            inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
            placeholder="Enter instance name"
            autoComplete="off"
            value={values?.instanceName}
            onChange={(nextValue) => handleInstanceNameChange(nextValue)}
          />
          {errors?.['instanceName'] && (
            <ErrorMessage>{errors['instanceName'].message}</ErrorMessage>
          )}
        </div>

        <div>
          <Label className={labelClassName}>Instance Duration:</Label>
          <Input
            id="instanceDuration"
            isControlled
            inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
            placeholder="Enter instance duration"
            autoComplete="off"
            type="number"
            min={1}
            value={values?.instanceDuration?.toString()}
            onChange={(nextValue) => handleInstanceDurationChange(nextValue)}
          />
          {errors?.['instanceDuration'] && (
            <ErrorMessage>{errors['instanceDuration'].message}</ErrorMessage>
          )}
        </div>
      </div>

      <div className='mt-8 space-y-4'>
        <Label className={labelClassName}>Permitted Callers:</Label>
        {errors?.['permittedCallers'] && (
          <ErrorMessage>{errors['permittedCallers'].message}</ErrorMessage>
        )}
        {Children.toArray(permittedCallers.map((caller, index) => (
          <div className='pl-4'>
            <Label className={labelClassName}>Permitted Caller {index + 1}:</Label>
            <div className='flex gap-2'>
              <Input
                id={`permittedCallers-${index}`}
                value={caller}
                isControlled
                onChange={(nextValue) => handleCallerChange(index, nextValue)}
                className='flex-grow'
                inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10 w-full"
                placeholder="Enter permitted caller"
                autoComplete="off"
              />
              <IconButton
                onClick={() => handleRemoveCaller(index)}
                className="flex-shrink-0"
              >
                <TrashIcon className='h-5 w-5' />
              </IconButton>
            </div>
            {errors?.['permittedCallers']?.[index] && (
              <ErrorMessage>{errors['permittedCallers'][index].message}</ErrorMessage>
            )}
          </div>
        )))}
        
        <Button
          onClick={() => {
            setValue(`${stepKey}.permittedCallers`, [...permittedCallers, '' as SubstrateAddress | EvmAddress]);
          }}
          className="mt-4"
        >
          Add Caller
        </Button>
      </div>
    </div>
  );
};
