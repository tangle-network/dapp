'use client';

import { isAddress } from '@polkadot/util-crypto';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { isEvmAddress } from '../../utils/isEvmAddress';
import BaseInput, { BaseInputProps } from '../AmountInput/BaseInput';

export enum AddressType {
  EVM,
  Substrate,
  Both,
}

export type AddressInputProps = {
  id: string;
  title: string;
  placeholder?: string;
  type: AddressType;
  showPasteButton?: boolean;
  value: string;
  isDisabled?: boolean;
  baseInputOverrides?: Partial<BaseInputProps>;
  setValue: (newValue: string) => void;
  setErrorMessage?: (error: string | null) => void;
};

const AddressInput: FC<AddressInputProps> = ({
  id,
  title,
  placeholder,
  type,
  value,
  setValue,
  showPasteButton = true,
  isDisabled = false,
  baseInputOverrides,
  setErrorMessage: setErrorMessageOnParent,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePasteAction = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      setValue(text.trim());
    });
  }, [setValue]);

  const actions: ReactNode = (
    <>
      {showPasteButton && (
        <Button
          isDisabled={value !== ''}
          key="paste"
          size="sm"
          variant="utility"
          onClick={handlePasteAction}
          className="uppercase"
        >
          Paste
        </Button>
      )}

      {baseInputOverrides?.actions}
    </>
  );

  const handleChange = useCallback(
    (newValue: string) => {
      if (newValue === '') {
        setErrorMessage(null);
        setValue(newValue);

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

      setValue(newValue);
    },
    [setValue, type]
  );

  // Set the error message in the parent component.
  useEffect(() => {
    if (setErrorMessageOnParent !== undefined) {
      setErrorMessageOnParent(errorMessage);
    }
  }, [errorMessage, setErrorMessageOnParent]);

  return (
    <BaseInput
      id={id}
      title={title}
      errorMessage={errorMessage ?? undefined}
      {...baseInputOverrides}
      actions={actions}
    >
      <Input
        id={id}
        inputRef={inputRef}
        inputClassName="placeholder:text-md"
        type="text"
        placeholder={placeholder}
        size="sm"
        autoComplete="off"
        value={value}
        onChange={handleChange}
        isInvalid={errorMessage !== null}
        isDisabled={isDisabled}
        isControlled
      />
    </BaseInput>
  );
};

export default AddressInput;
