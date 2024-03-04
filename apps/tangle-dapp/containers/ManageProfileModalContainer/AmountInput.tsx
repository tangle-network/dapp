import { BN } from '@polkadot/util';
import { Button, Input } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { Dispatch, FC, SetStateAction } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useMaxRestakingAmount from '../../data/restaking/useMaxRestakingAmount';
import convertChainUnitsToNumber from '../../utils/convertChainUnitsToNumber';
import BaseInput from './BaseInput';

export type AmountInputProps = {
  id: string;
  title: string;
  amount: BN | null;
  setAmount: Dispatch<SetStateAction<BN | null>>;
};

const AmountInput: FC<AmountInputProps> = ({
  id,
  title,
  amount,
  setAmount,
}) => {
  const maxRestakingAmount = useMaxRestakingAmount();

  const amountAsString =
    amount !== null ? convertChainUnitsToNumber(amount).toString() : '';

  const setMaxRestakingAmount = () => {
    assert(
      maxRestakingAmount !== null,
      'Should not be able to set max restaking amount if not yet loaded, since the max button should have been disabled'
    );

    setAmount(maxRestakingAmount);
  };

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
    <BaseInput id={id} title={title} actions={actions}>
      <Input
        id={id}
        inputClassName="placeholder:text-md"
        type="number"
        inputMode="numeric"
        placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
        size="sm"
        autoComplete="off"
        value={amountAsString}
      />
    </BaseInput>
  );
};

export default AmountInput;
