import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config/constants/tangle';
import useNetworkStore from '../context/useNetworkStore';
import { Button, Input } from '@tangle-network/ui-components';
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import useInputAmount from '../hooks/useInputAmount';
import InputWrapper, { InputWrapperProps } from './InputWrapper';

export type AmountInputProps = {
  id: string;
  title: string;
  min?: BN | null;
  max?: BN | null;
  minErrorMessage?: string;
  maxErrorMessage?: string;
  showMaxAction?: boolean;
  amount: BN | null;
  decimals?: number;
  isDisabled?: boolean;
  wrapperOverrides?: Partial<InputWrapperProps>;
  errorOnEmptyValue?: boolean;
  setAmount: (newAmount: BN | null) => void;
  setErrorMessage?: (error: string | null) => void;
  placeholder?: string;
  wrapperClassName?: string;
  bodyClassName?: string;
  dropdownBodyClassName?: string;
  showErrorMessage?: boolean;
  inputClassName?: string;
};

const AmountInput: FC<AmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
  min = null,
  max = null,
  // Default to the Tangle token decimals.
  decimals = TANGLE_TOKEN_DECIMALS,
  minErrorMessage,
  maxErrorMessage,
  showMaxAction = true,
  isDisabled = false,
  wrapperOverrides,
  errorOnEmptyValue = false,
  setErrorMessage,
  placeholder,
  wrapperClassName,
  bodyClassName,
  dropdownBodyClassName,
  showErrorMessage = true,
  inputClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { nativeTokenSymbol } = useNetworkStore();

  const { displayAmount, errorMessage, handleChange, setDisplayAmount } =
    useInputAmount({
      amount,
      min,
      max,
      decimals,
      errorOnEmptyValue,
      setAmount,
      minErrorMessage,
      maxErrorMessage,
    });

  // Set the error message in the parent component.
  useEffect(() => {
    if (setErrorMessage !== undefined) {
      setErrorMessage(errorMessage);
    }
  }, [errorMessage, setErrorMessage]);

  const setMaxAmount = useCallback(() => {
    if (max !== null && amount?.toString() !== max.toString()) {
      setAmount(max);
      setDisplayAmount(max);
    }
  }, [amount, max, setAmount, setDisplayAmount]);

  const actions: ReactNode = useMemo(
    () => (
      <>
        {max !== null && showMaxAction && (
          <Button
            isDisabled={(amount !== null && amount.eq(max)) || isDisabled}
            key="max"
            size="sm"
            variant="utility"
            onClick={() => setMaxAmount()}
            className="uppercase"
          >
            Max
          </Button>
        )}

        {wrapperOverrides?.actions}
      </>
    ),
    [max, showMaxAction, amount, isDisabled, setMaxAmount, wrapperOverrides],
  );

  return (
    <InputWrapper
      id={id}
      title={title}
      errorMessage={errorMessage ?? undefined}
      isDisabled={isDisabled}
      {...wrapperOverrides}
      actions={actions}
      wrapperClassName={wrapperClassName}
      bodyClassName={bodyClassName}
      dropdownBodyClassName={dropdownBodyClassName}
      showErrorMessage={showErrorMessage}
    >
      <Input
        id={id}
        inputRef={inputRef}
        inputClassName={twMerge(
          'placeholder:text-lg text-lg',
          errorMessage !== null && 'text-red-70 dark:text-red-50',
          inputClassName,
        )}
        type="text"
        placeholder={placeholder ?? `0 ${nativeTokenSymbol}`}
        size="sm"
        autoComplete="off"
        value={displayAmount}
        onChange={handleChange}
        isInvalid={errorMessage !== null}
        isDisabled={isDisabled}
        isControlled
      />
    </InputWrapper>
  );
};

export default AmountInput;
