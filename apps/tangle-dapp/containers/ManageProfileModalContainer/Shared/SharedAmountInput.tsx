import { BN } from '@polkadot/util';
import { Button, Input } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useRef } from 'react';

import BaseInput from '../../../components/AmountInput/BaseInput';
import useInputAmount from '../../../components/AmountInput/useInputAmount';
import useNetworkStore from '../../../context/useNetworkStore';
import useRestakingJobs from '../../../data/restaking/useRestakingJobs';
import useRestakingLimits from '../../../data/restaking/useRestakingLimits';
import useRestakingProfile from '../../../data/restaking/useRestakingProfile';
import useSharedRestakeAmount from '../../../data/restaking/useSharedRestakeAmount';
import { RestakingProfileType } from '../../../types';
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
  const { sharedRestakeAmount } = useSharedRestakeAmount();
  const { maxRestakingAmount, minRestakingBond } = useRestakingLimits();
  const { hasActiveJobs } = useRestakingJobs();
  const { profileTypeOpt } = useRestakingProfile();
  const { nativeTokenSymbol } = useNetworkStore();

  const hasActiveJobsForSharedProfile = (() => {
    // Lock by default until props finish loading to prevent
    // invalid modifications by the user.
    if (profileTypeOpt === null || hasActiveJobs === null) {
      return true;
    }

    return (
      hasActiveJobs && profileTypeOpt.value === RestakingProfileType.SHARED
    );
  })();

  const min = hasActiveJobsForSharedProfile
    ? sharedRestakeAmount?.value ?? minRestakingBond
    : minRestakingBond;

  const minErrorMessage = hasActiveJobsForSharedProfile
    ? 'Cannot decrease shared restake amount when there are active jobs'
    : ERROR_MIN_RESTAKING_BOND;

  const {
    displayAmount: amountString,
    errorMessage,
    handleChange,
  } = useInputAmount(
    amount,
    min,
    maxRestakingAmount,
    true,
    setAmount,
    minErrorMessage,
    ERROR_NOT_ENOUGH_BALANCE
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
