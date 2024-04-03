import { BN } from '@polkadot/util';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useCallback, useEffect, useRef } from 'react';

import { useErrorCountContext } from '../../context/ErrorsContext';
import useNetworkStore from '../../context/useNetworkStore';
import BaseInput, { BaseInputProps } from './BaseInput';
import useInputAmount from './useInputAmount';

export type AmountInput2Props = {
  id: string;
  title: string;
  min?: BN;
  max?: BN;
  minErrorMessage?: string;
  maxErrorMessage?: string;
  showMaxAction?: boolean;
  amount: BN | null;
  setAmount: (newAmount: BN | null) => void;
  isDisabled?: boolean;
  baseInputOverrides?: Partial<BaseInputProps>;
};

const AmountInput2: FC<AmountInput2Props> = ({
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
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { nativeTokenSymbol } = useNetworkStore();
  const { addError, removeError } = useErrorCountContext();

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

  const { displayAmount, refreshDisplayAmount, errorMessage, handleChange } =
    useInputAmount(
      amount,
      min ?? null,
      max ?? null,
      true,
      setAmount,
      minErrorMessage,
      maxErrorMessage
    );

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
          isDisabled={amount === null || amount.eq(max) || isDisabled}
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

export default AmountInput2;
