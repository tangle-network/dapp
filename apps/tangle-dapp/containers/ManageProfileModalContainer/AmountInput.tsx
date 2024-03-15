import { BN } from '@polkadot/util';
import { Button, Input } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useRef } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { ERROR_MIN_RESTAKING_BOND } from './AllocationInput';
import BaseInput from './BaseInput';
import useInputAmount from './useInputAmount';

export type AmountInputProps = {
  id: string;
  title: string;
  amount: BN;
  setAmount: (newAmount: BN | null) => void;
};

const AmountInput: FC<AmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
}) => {
  const { maxRestakingAmount, minRestakingBond } = useRestakingLimits();

  const { amountString, errorMessage, handleChange } = useInputAmount(
    amount,
    minRestakingBond,
    maxRestakingAmount,
    ERROR_MIN_RESTAKING_BOND,
    true,
    setAmount
  );

  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <BaseInput
      id={id}
      title={title}
      actions={actions}
      errorMessage={errorMessage ?? undefined}
    >
      <Input
        id={id}
        inputRef={inputRef}
        inputClassName="placeholder:text-md"
        type="text"
        placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
        size="sm"
        autoComplete="off"
        value={amountString}
        onChange={handleChange}
        isInvalid={errorMessage !== null}
        isControlled
      />
    </BaseInput>
  );
};

export default AmountInput;
