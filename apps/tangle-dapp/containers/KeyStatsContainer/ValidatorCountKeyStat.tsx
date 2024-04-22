'use client';

import { FC } from 'react';

import KeyStatsItem from '../../components/KeyStatsItem/KeyStatsItem';
import useValidatorCountSubscription from '../../data/KeyStats/useValidatorsCountSubscription';

const ValidatorCountKeyStat: FC = () => {
  const {
    data: validatorCount,
    isLoading: isValidatorCountLoading,
    error: validatorCountError,
  } = useValidatorCountSubscription();

  return (
    <KeyStatsItem
      title="Validators"
      tooltip="Current number of active validators out of the total allowed."
      error={validatorCountError}
      isLoading={isValidatorCountLoading}
    >
      {validatorCount?.value1}/{validatorCount?.value2}
    </KeyStatsItem>
  );
};

export default ValidatorCountKeyStat;
