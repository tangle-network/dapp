import { BN } from '@polkadot/util';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useCallback, useEffect, useRef } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import BaseInput, { BaseInputProps } from './BaseInput';
import useInputAmount from './useInputAmount';

export type AmountInputProps = {
  id: string;
  title: string;
  min?: BN;
  max?: BN;
  minErrorMessage?: string;
  maxErrorMessage?: string;
  showMaxAction?: boolean;
  amount: BN | null;
  isDisabled?: boolean;
  baseInputOverrides?: Partial<BaseInputProps>;
  errorOnEmptyValue?: boolean;
  setAmount: (newAmount: BN | null) => void;
  setErrorMessage?: (error: string | null) => void;
};

const AmountInput: FC<AmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
  min,
  max,
  minErrorMessage,
  maxErrorMessage,
  showMaxAction = true,
  isDisabled = false,
  baseInputOverrides,
  errorOnEmptyValue = false,
  setErrorMessage,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { nativeTokenSymbol } = useNetworkStore();

  const { displayAmount, refreshDisplayAmount, errorMessage, handleChange } =
    useInputAmount(
      amount,
      min ?? null,
      max ?? null,
      errorOnEmptyValue,
      setAmount,
      minErrorMessage,
      maxErrorMessage
    );

  // Set the error message in the parent component.
  useEffect(() => {
    if (setErrorMessage !== undefined) {
      setErrorMessage(errorMessage);
    }
  }, [errorMessage, setErrorMessage]);

  const setMaxAmount = useCallback(() => {
    if (max !== undefined) {
      setAmount(max);
      refreshDisplayAmount(max);
      inputRef.current?.focus();
    }
  }, [max, refreshDisplayAmount, setAmount]);

  const actions: ReactNode = (
    <>
      {max !== undefined && showMaxAction && (
        <Button
          isDisabled={
            max === null || (amount !== null && amount.eq(max)) || isDisabled
          }
          key="max"
          size="sm"
          variant="utility"
          onClick={setMaxAmount}
          className="uppercase"
        >
          Max
        </Button>
      )}

      {baseInputOverrides?.actions}
    </>
  );

  return (
    <BaseInput
      id={id}
      title={title}
      errorMessage={errorMessage ?? undefined}
      isDisabled={isDisabled}
      {...baseInputOverrides}
      actions={actions}
    >
      <Input
        id={id}
        inputRef={inputRef}
        inputClassName="placeholder:text-md"
        type="text"
        placeholder={`0 ${nativeTokenSymbol}`}
        size="sm"
        autoComplete="off"
        value={displayAmount}
        onChange={handleChange}
        isInvalid={errorMessage !== null}
        isDisabled={isDisabled}
        isControlled
      />
    </BaseInput>
  );
};

export default AmountInput;
