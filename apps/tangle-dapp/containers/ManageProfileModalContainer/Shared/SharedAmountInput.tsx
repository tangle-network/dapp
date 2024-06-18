import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, useRef } from 'react';

import BaseInput from '../../../components/AmountInput/BaseInput';
import useNetworkStore from '../../../context/useNetworkStore';
import useInputAmount from '../../../hooks/useInputAmount';
import {
  ERROR_MIN_RESTAKING_BOND,
  ERROR_NOT_ENOUGH_BALANCE,
} from '../Independent/IndependentAllocationInput';

export type SharedAmountInputProps = {
  id: string;
  title: string;
  amount: BN;
  setAmount: (newAmount: BN | null) => void;
};

const SharedAmountInput: FC<SharedAmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const hasActiveJobsForSharedProfile = (() => {
    return false;
  })();

  const minErrorMessage = hasActiveJobsForSharedProfile
    ? 'Cannot decrease shared restake amount when there are active jobs'
    : ERROR_MIN_RESTAKING_BOND;

  const {
    displayAmount: amountString,
    errorMessage,
    handleChange,
  } = useInputAmount({
    amount,
    min: null,
    max: null,
    errorOnEmptyValue: true,
    setAmount,
    decimals: TANGLE_TOKEN_DECIMALS,
    minErrorMessage,
    maxErrorMessage: ERROR_NOT_ENOUGH_BALANCE,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    <Button key="max" size="sm" variant="utility" className="uppercase">
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
        placeholder={`0 ${nativeTokenSymbol}`}
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

export default SharedAmountInput;
