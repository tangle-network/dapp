'use client';

import { Search } from '@webb-tools/icons';
import {
  Avatar,
  CheckBox,
  CopyWithTooltip,
  Input,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import React, { useState } from 'react';

import { ValidatorListProps } from './types';

export const ValidatorList = ({
  validators,
  selectedValidators,
  setSelectedValidators,
}: ValidatorListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedValidators = [...validators].sort((a, b) => {
    const aSelected = selectedValidators.includes(a.address);
    const bSelected = selectedValidators.includes(b.address);
    return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
  });

  const filteredValidators = sortedValidators.filter(
    (validator) =>
      validator.identity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validator.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validatorElements = filteredValidators.map((validator) => {
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
        />
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

    return checkbox;
  });

  return (
    <div>
      <Input
        id="token"
        rightIcon={<Search />}
        placeholder="Search validators..."
        value={searchTerm}
        onChange={(val) => setSearchTerm(val)}
        className="mb-1"
      />
      <div className="max-h-[348px] overflow-scroll flex flex-col gap-2 p-3 border dark:border-mono-160">
        {validatorElements}
      </div>
    </div>
  );
};
