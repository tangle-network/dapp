'use client';

import { isAddress } from '@polkadot/util-crypto';
import { Avatar, Button, Input } from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { isEvmAddress } from '../utils/isEvmAddress';
import InputWrapper, { InputWrapperProps } from './InputWrapper';

export enum AddressType {
  EVM,
  Substrate,
  Both,
}

export type AddressInputProps = {
  id: string;
  title: string;
  placeholder?: string;
  tooltip?: string;
  type: AddressType;
  showPasteButton?: boolean;
  value: string;
  isDisabled?: boolean;
  wrapperOverrides?: Partial<InputWrapperProps>;
  setValue: (newValue: string) => void;
  setErrorMessage?: (error: string | null) => void;
};

const AddressInput: FC<AddressInputProps> = ({
  id,
  title,
  tooltip,
  placeholder,
  type,
  value,
  setValue,
  showPasteButton = true,
  isDisabled = false,
  wrapperOverrides,
  setErrorMessage: setErrorMessageOnParent,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePasteAction = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setValue(text.trim());
    });
  }, [setValue]);

  const actions: ReactNode =
    value === '' && showPasteButton ? (
      <>
        <Button
          key="paste"
          size="sm"
          variant="utility"
          onClick={handlePasteAction}
          className="uppercase"
        >
          Paste
        </Button>

        {wrapperOverrides?.actions}
      </>
    ) : (
      wrapperOverrides?.actions
    );

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);

      if (newValue === '') {
        setErrorMessage(null);

        return;
      }

      const isEvm = isEvmAddress(newValue);
      const isSubstrate = isAddress(newValue);

      if (!isEvm && !isSubstrate) {
        setErrorMessage('Invalid address');
      } else if (type === AddressType.EVM && !isEvm) {
        setErrorMessage('Invalid EVM address');
      } else if (type === AddressType.Substrate && !isSubstrate) {
        setErrorMessage('Invalid Substrate address');
      } else {
        setErrorMessage(null);
      }
    },
    [setValue, type],
  );

  // Set the error message in the parent component.
  useEffect(() => {
    if (setErrorMessageOnParent !== undefined) {
      setErrorMessageOnParent(errorMessage);
    }
  }, [errorMessage, setErrorMessageOnParent]);

  const isEvm = isEvmAddress(value);

  return (
    <InputWrapper
      id={id}
      title={title}
      tooltip={tooltip}
      errorMessage={errorMessage ?? undefined}
      bodyClassName="flex items-center gap-1"
      {...wrapperOverrides}
      actions={actions}
    >
      {value && (
        <Avatar theme={isEvm ? 'ethereum' : 'substrate'} value={value} />
      )}

      <Input
        id={id}
        inputRef={inputRef}
        className="w-full"
        inputClassName="placeholder:text-lg text-lg"
        type="text"
        placeholder={placeholder}
        size="sm"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        isInvalid={errorMessage !== null}
        isDisabled={isDisabled}
        isControlled
        spellCheck={false}
      />
    </InputWrapper>
  );
};

export default AddressInput;
