import { Alert, Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { ValidatorList } from '../../components';
import { SelectDelegatesProps } from './types';

const SelectDelegates: FC<SelectDelegatesProps> = ({
  validators,
  selectedValidators,
  setSelectedValidators,
}) => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-9">
        <div className="flex flex-col gap-2 col-span-2">
          <Typography
            variant="body1"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            Candidate Accounts {validators.length}
          </Typography>

          <ValidatorList
            validators={validators}
            selectedValidators={selectedValidators}
            setSelectedValidators={setSelectedValidators}
            sortBy={[
              { key: 'effectiveAmountStakedRaw', title: 'Total Stake' },
              { key: 'delegations', title: '# of Nominations' },
            ]}
          />

          <Typography
            variant="body1"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            Selected: {selectedValidators.length}/{validators.length}
          </Typography>
        </div>

        <div className="flex flex-col gap-5 col-span-1">
          <Typography variant="body1" fw="normal">
            Validators can be selected manually to nominate from the list of all
            currently available validators.
          </Typography>

          <Typography variant="body1" fw="normal">
            Once transmitted the new selection will only take effect in 2 eras
            taking the new validator election cycle into account. Until then,
            the nominations will show as inactive.
          </Typography>
        </div>
      </div>

      <Alert
        type="info"
        description="You should trust your delegator to act competently and honest; basing your decision purely on their current profitability could lead to reduced profits or even loss of funds."
        className="mt-4"
      />

      <Alert
        type="info"
        description="When you select validators to nominate, you will overwrite your previous nominations if you have any."
        className="mt-4"
      />
    </div>
  );
};

export default SelectDelegates;
