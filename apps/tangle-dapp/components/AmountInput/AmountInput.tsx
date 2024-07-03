import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useInputAmount from '../../hooks/useInputAmount';
import BaseInput, { BaseInputProps } from './BaseInput';

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
  baseInputOverrides?: Partial<BaseInputProps>;
  errorOnEmptyValue?: boolean;
  setAmount: (newAmount: BN | null) => void;
  setErrorMessage?: (error: string | null) => void;
  placeholder?: string;
  wrapperClassName?: string;
  bodyClassName?: string;
  dropdownBodyClassName?: string;
  errorMessageClassName?: string;
};

const AmountInput: FC<AmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
  min = null,
  max = null,
  decimals = TANGLE_TOKEN_DECIMALS, // Default to the Tangle token decimals.
  minErrorMessage,
  maxErrorMessage,
  showMaxAction = true,
  isDisabled = false,
  baseInputOverrides,
  errorOnEmptyValue = false,
  setErrorMessage,
  placeholder,
  wrapperClassName,
  bodyClassName,
  dropdownBodyClassName,
  errorMessageClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { nativeTokenSymbol } = useNetworkStore();

  const { displayAmount, errorMessage, handleChange } = useInputAmount({
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
    if (max !== null) {
      setAmount(max);
    }
  }, [max, setAmount]);

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

        {baseInputOverrides?.actions}
      </>
    ),
    [max, showMaxAction, amount, isDisabled, setMaxAmount, baseInputOverrides],
  );

  return (
    <BaseInput
      id={id}
      title={title}
      errorMessage={errorMessage ?? undefined}
      isDisabled={isDisabled}
      {...baseInputOverrides}
      actions={actions}
      wrapperClassName={wrapperClassName}
      bodyClassName={bodyClassName}
      dropdownBodyClassName={dropdownBodyClassName}
      errorMessageClassName={errorMessageClassName}
    >
      <Input
        id={id}
        inputRef={inputRef}
        inputClassName="placeholder:text-md"
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
    </BaseInput>
  );
};

export default AmountInput;
