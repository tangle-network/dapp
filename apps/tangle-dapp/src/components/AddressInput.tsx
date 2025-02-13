import {
  Avatar,
  Button,
  Input,
  isEvmAddress,
  isSolanaAddress,
  isSubstrateAddress,
} from '@tangle-network/ui-components';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import InputWrapper, { InputWrapperProps } from './InputWrapper';
import { AddressType } from '../constants';

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
  showErrorMessage?: boolean;
  inputClassName?: string;
  showAvatar?: boolean;
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
  showErrorMessage = true,
  inputClassName,
  showAvatar = true,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateError = useCallback(
    (newValue: string) => {
      if (newValue === '') {
        setErrorMessage(null);

        return;
      }

      const isEvm = isEvmAddress(newValue);
      const isSubstrate = isSubstrateAddress(newValue);
      const isSolana = isSolanaAddress(newValue);

      if (type === AddressType.EVM && !isEvm) {
        setErrorMessage('Invalid EVM address');
      } else if (type === AddressType.SUBSTRATE && !isSubstrate) {
        setErrorMessage('Invalid Substrate address');
      } else if (type === AddressType.SOLANA && !isSolana) {
        setErrorMessage('Invalid Solana address');
      } else {
        setErrorMessage(null);
      }
    },
    [type],
  );

  const handlePasteAction = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      const newValue = text.trim();

      setValue(newValue);
      updateError(newValue);
    });
  }, [setValue, updateError]);

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
      updateError(newValue);
    },
    [setValue, updateError],
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
      bodyClassName="flex items-center gap-2"
      {...wrapperOverrides}
      actions={actions}
      showErrorMessage={showErrorMessage}
    >
      {value && showAvatar && (
        <Avatar
          theme={isEvm ? 'ethereum' : 'substrate'}
          value={value}
          size="md"
        />
      )}

      <Input
        id={id}
        inputRef={inputRef}
        className="w-full"
        inputClassName={twMerge(
          'placeholder:text-lg text-lg',
          errorMessage !== null && 'text-red-70 dark:text-red-50',
          inputClassName,
        )}
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
