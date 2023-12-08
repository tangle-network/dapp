import {
  Avatar,
  CheckBox,
  CopyWithTooltip,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import React from 'react';

import { ValidatorListProps } from './types';

export const ValidatorList = ({
  validators,
  selectedValidators,
  setSelectedValidators,
}: ValidatorListProps) => {
  const selected: React.JSX.Element[] = [];
  const unselected: React.JSX.Element[] = [];

  validators.forEach((validator) => {
    const isSelected = selectedValidators.includes(validator.address);
    const checkbox = (
      <div className="flex !items-center gap-1">
        <CheckBox
          key={validator.address}
          isChecked={isSelected}
          onChange={() => {
            if (isSelected) {
              setSelectedValidators(
                selectedValidators.filter(
                  (selectedValidator) => selectedValidator !== validator.address
                )
              );
            } else {
              setSelectedValidators([...selectedValidators, validator.address]);
            }
          }}
        ></CheckBox>
        <Avatar value={validator.address} theme="substrate" />
        <Typography variant="h5" fw="bold">
          {validator.identity !== ''
            ? shortenString(validator.identity, 10)
            : shortenString(validator.address, 6)}
        </Typography>
        <CopyWithTooltip
          textToCopy={validator.address}
          isButton={false}
          className="cursor-pointer"
        />
      </div>
    );

    if (isSelected) {
      selected.push(checkbox);
    } else {
      unselected.push(checkbox);
    }
  });

  const combinedValidators = [...selected, ...unselected];

  return (
    <div className="max-h-[348px] overflow-scroll flex flex-col gap-2 p-3 border dark:border-mono-160">
      {combinedValidators}
    </div>
  );
};
