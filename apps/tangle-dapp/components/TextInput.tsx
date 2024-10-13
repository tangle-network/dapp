import { Input } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import InputWrapper, { InputWrapperProps } from './InputWrapper';

export type TextInputProps = {
  id: string;
  title: string;
  value: string;
  setValue: (newValue: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  baseInputOverrides?: Partial<InputWrapperProps>;
};

const TextInput: FC<TextInputProps> = ({
  id,
  title,
  value,
  setValue,
  placeholder,
  isDisabled = false,
  baseInputOverrides,
}) => {
  return (
    <InputWrapper
      id={id}
      title={title}
      isDisabled={isDisabled}
      {...baseInputOverrides}
    >
      <Input
        id={id}
        inputClassName="placeholder:text-md"
        type="text"
        placeholder={placeholder}
        size="sm"
        autoComplete="off"
        value={value}
        onChange={setValue}
        isDisabled={isDisabled}
        isControlled
      />
    </InputWrapper>
  );
};

export default TextInput;
