'use client';

import { isAddress } from '@polkadot/util-crypto';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useErrorCountContext } from '../../context/ErrorsContext';
import { isEvmAddress } from '../../utils/isEvmAddress';
import BaseInput, { BaseInputProps } from '../AmountInput2/BaseInput';

export enum AddressType {
  EVM,
  Substrate,
  Both,
}

export type AddressInput2Props = {
  id: string;
  title: string;
  placeholder?: string;
  type: AddressType;
  showPasteButton?: boolean;
  value: string;
  setValue: (newValue: string) => void;
  isDisabled?: boolean;
  baseInputOverrides?: Partial<BaseInputProps>;
};

const AddressInput2: FC<AddressInput2Props> = ({
  id,
  title,
  placeholder,
  type,
  value,
  setValue,
  showPasteButton = true,
  isDisabled = false,
  baseInputOverrides,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { addError, removeError } = useErrorCountContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Add error if there is an error message, or remove
  // it if there is none. This helps parent components
  // to easily track whether there are any errors in their
  // children, and allows them to determine whether to enable
  // the submit or continue button.
  useEffect(() => {
    if (errorMessage !== null) {
      addError(id);
    } else {
      removeError(id);
    }
  });

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
      }

      setValue(newValue);
    },
    [setValue, type]
  );

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

export default AddressInput2;
