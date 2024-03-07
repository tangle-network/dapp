import { BN } from '@polkadot/util';
import { Button, Input } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useRef } from 'react';
import { z } from 'zod';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import convertChainUnitsToNumber from '../../utils/convertChainUnitsToNumber';
import BaseInput from './BaseInput';

export type AmountInputProps = {
  id: string;
  title: string;
  amount: BN | null;
  setAmount: (newAmount: BN) => void;
  onChange: (newValue: string) => void;
};

export const DECIMAL_REGEX = /^\d*(\.\d+)?$/;

export function createAmountZodSchema(
  amount: BN | null,
  min: BN | null,
  max: BN | null
) {
  return z
    .string()
    .regex(
      DECIMAL_REGEX,
      'Only digits or numbers with a decimal point are allowed'
    )
    .refine(() => amount === null || min === null || amount.gte(min), {
      message: `Must be at least the minimum restaking bond`,
    })
    .refine(() => amount === null || max === null || amount.lte(max), {
      message: 'Not enough available balance',
    });
}

const AmountInput: FC<AmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
  onChange,
}) => {
  const { maxRestakingAmount, minRestakingBond } = useRestakingLimits();
  const inputRef = useRef<HTMLInputElement>(null);

  const amountAsString =
    amount !== null ? convertChainUnitsToNumber(amount).toString() : '';

  const setMaxRestakingAmount = useCallback(() => {
    assert(
      maxRestakingAmount !== null,
      'Should not be able to set max restaking amount if not yet loaded, since the max button should have been disabled'
    );

    setAmount(maxRestakingAmount);

    // Focus after setting the max value.
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [maxRestakingAmount, setAmount]);

  const actions = [
    <Button
      isDisabled={maxRestakingAmount === null}
      key="max"
      size="sm"
      variant="utility"
      onClick={setMaxRestakingAmount}
      className="uppercase"
    >
      Max
    </Button>,
  ];

  const validationResult = createAmountZodSchema(
    amount,
    minRestakingBond,
    maxRestakingAmount
  ).safeParse(amountAsString);

  // Pick the first error message, since the input component does
  // not support displaying a list of error messages.
  const errorMessage = !validationResult.success
    ? validationResult.error.issues[0].message
    : undefined;

  return (
    <BaseInput
      id={id}
      title={title}
      actions={actions}
      errorMessage={errorMessage}
    >
      <Input
        id={id}
        inputRef={inputRef}
        inputClassName="placeholder:text-md"
        type="number"
        inputMode="numeric"
        placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
        size="sm"
        autoComplete="off"
        value={amountAsString}
        onChange={onChange}
        isControlled
      />
    </BaseInput>
  );
};

export default AmountInput;
