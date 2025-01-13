import type { PrimitiveFieldType } from '@webb-tools/tangle-shared-ui/types/blueprint';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import set from 'lodash/set';
import { useCallback, useState } from 'react';
import FieldTypeInput from './FieldTypeInput';

type ParamsFormProps = {
  params: PrimitiveFieldType[];
  // TODO: Determine the type of the form values
  onSave: (values: Record<string, any>) => void;
};

const ParamsForm = ({ params, onSave }: ParamsFormProps) => {
  // TODO: Determine the type of the form values
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // TODO: Validate the form values
  // this is just a simple validation for now
  const isValid = Object.keys(formValues).length === params.length;

  const handleSave = () => {
    if (!isValid) {
      return;
    }

    onSave(formValues);
  };

  const handleValueChange = useCallback((id: string, newValue: any) => {
    setFormValues((prev) => {
      return set({ ...prev }, id, newValue);
    });
  }, []);

  return (
    <div className="grid gap-4 p-0 mt-3 sm:grid-cols-2">
      {params.map((param, idx) => {
        return (
          <FieldTypeInput
            key={`ParamsForm-${idx}`}
            label={`Param ${idx + 1}`}
            fieldType={param}
            id={idx.toString()}
            value={formValues[idx]}
            onValueChange={handleValueChange}
          />
        );
      })}

      <div></div>

      <Button isFullWidth isDisabled={!isValid} onClick={handleSave}>
        Save
      </Button>
    </div>
  );
};

export default ParamsForm;
