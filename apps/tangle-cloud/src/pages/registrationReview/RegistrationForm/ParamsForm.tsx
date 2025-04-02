import type { PrimitiveFieldType } from '@tangle-network/tangle-shared-ui/types/blueprint';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import set from 'lodash/set';
import { Children, useCallback, useState } from 'react';
import FieldTypeInput from './FieldTypeInput';
import { Label } from '@tangle-network/ui-components/components/Label';
import { TextField } from '@tangle-network/ui-components';

type ParamsFormProps = {
  params: PrimitiveFieldType[];
  // TODO: Determine the type of the form values
  onSave: (values: Record<string, any>, amount: string) => void;
  tokenSymbol: string;
  amountValue: string;
  paramsValue: Record<string, any>;
};

const ParamsForm = ({
  params,
  onSave,
  tokenSymbol,
  amountValue,
  paramsValue,
}: ParamsFormProps) => {
  // TODO: Determine the type of the form values
  const [formValues, setFormValues] =
    useState<Record<string, any>>(paramsValue);
  const [formAmount, setFormAmount] = useState<string>(amountValue);

  // TODO: Validate the form values
  // this is just a simple validation for now
  const isValid =
    Object.keys(formValues).length === params.length && !!formAmount;

  const handleSave = () => {
    if (!isValid) {
      return;
    }

    onSave(formValues, formAmount);
  };

  const handleValueChange = useCallback((id: string, newValue: any) => {
    setFormValues((prev) => {
      return set({ ...prev }, id, newValue);
    });
  }, []);

  return (
    <div>
      <div className="grid gap-4 p-0 mt-3 sm:grid-cols-2 mb-5">
        {Children.toArray(
          params.map((param, idx) => {
            return (
              <FieldTypeInput
                label={`Param ${idx + 1}`}
                fieldType={param}
                id={idx.toString()}
                value={formValues[idx]}
                onValueChange={handleValueChange}
                tabIndex={idx + 1}
              />
            );
          }),
        )}

        <div className="space-y-2">
          <Label>Enter the value of {tokenSymbol} to register</Label>

          <TextField.Root>
            <TextField.Input
              placeholder="0.00"
              type="number"
              inputMode="numeric"
              value={formAmount}
              onChange={(e) => {
                setFormAmount(e.target.value);
              }}
              min={0}
              tabIndex={params.length + 1}
            />
          </TextField.Root>
        </div>
      </div>

      <Button isFullWidth isDisabled={!isValid} onClick={handleSave}>
        Save
      </Button>
    </div>
  );
};

export default ParamsForm;
