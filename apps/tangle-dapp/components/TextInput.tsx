import BackspaceDeleteFillIcon from '@webb-tools/icons/BackspaceDeleteFillIcon';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import InputWrapper, { InputWrapperProps } from './InputWrapper';

export type TextInputProps = {
  id: string;
  title: string;
  value: string;
  setValue: (newValue: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  wrapperOverrides?: Partial<InputWrapperProps>;
};

const TextInput: FC<TextInputProps> = ({
  id,
  title,
  value,
  setValue,
  placeholder,
  isDisabled = false,
  wrapperOverrides,
}) => {
  const clearAction =
    value === '' ? undefined : (
      <Button size="sm" variant="utility" onClick={() => setValue('')}>
        <BackspaceDeleteFillIcon className="fill-current dark:fill-current" />
      </Button>
    );

  return (
    <InputWrapper
      id={id}
      title={title}
      isDisabled={isDisabled}
      actions={clearAction}
      {...wrapperOverrides}
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
