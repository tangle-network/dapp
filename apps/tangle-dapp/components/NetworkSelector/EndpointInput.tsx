import { DeleteBinWithBg, Save, SaveWithBg } from '@webb-tools/icons';
import { Input } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export type EndpointInputProps = {
  id: string;
  placeholder: string;
  isValid: boolean;
  value?: string;
  isSaved: boolean;
  setValue: (newValue: string) => void;
  setIsValid: (isValid: boolean) => void;
  handleDelete: () => void;
  handleSave: () => void;
};

const EndpointInput: FC<EndpointInputProps> = ({
  id,
  placeholder,
  isValid,
  value,
  isSaved,
  setValue,
  setIsValid,
  handleDelete,
  handleSave,
}) => {
  return (
    <Input
      id={id}
      placeholder={placeholder}
      errorMessage={!isValid ? 'Invalid endpoint' : ''}
      isInvalid={!isValid}
      value={value}
      onChange={setValue}
      // Disable validation when the user focuses on the input
      // to give them a chance to correct the value.
      onFocus={() => setIsValid(true)}
      rightIcon={
        isSaved ? (
          <DeleteBinWithBg className="cursor-pointer" onClick={handleDelete} />
        ) : value !== undefined ? (
          <SaveWithBg className="cursor-pointer" onClick={handleSave} />
        ) : (
          <Save className="pointer-events-none opacity-60 cursor-not-allowed" />
        )
      }
    />
  );
};

export default EndpointInput;
