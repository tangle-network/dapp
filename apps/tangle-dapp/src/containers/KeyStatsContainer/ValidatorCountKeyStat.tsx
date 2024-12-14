import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
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
      showDataBeforeLoading
      error={validatorCountError}
      isLoading={isValidatorCountLoading}
    >
      {validatorCount?.value1 ?? EMPTY_VALUE_PLACEHOLDER}/
      {validatorCount?.value2 ?? EMPTY_VALUE_PLACEHOLDER}
    </KeyStatsItem>
  );
};

export default ValidatorCountKeyStat;
