'use client';

import { CloseCircleLineIcon, Search } from '@webb-tools/icons';
import {
  Avatar,
  CheckBox,
  Chip,
  CopyWithTooltip,
  Input,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Validator } from '../../types';
import {
  SortableValidatorKeys,
  SortButtonProps,
  ValidatorListProps,
} from './types';

const sortValidators = (
  validators: Validator[],
  sortKey: keyof SortableValidatorKeys
) => {
  return validators.sort((a, b) => {
    const valueA = parseInt(a[sortKey], 10);
    const valueB = parseInt(b[sortKey], 10);
    return valueB - valueA;
  });
};

export const ValidatorList = ({
  validators,
  selectedValidators,
  setSelectedValidators,
  sortBy,
}: ValidatorListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] =
    useState<keyof SortableValidatorKeys>();

  let sortedValidators = [...validators];

  if (selectedSort) {
    sortedValidators = sortValidators(sortedValidators, selectedSort);
  } else {
    sortedValidators.sort((a, b) => {
      const aSelected = selectedValidators.includes(a.address);
      const bSelected = selectedValidators.includes(b.address);
      return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
    });
  }

  const filteredValidators = sortedValidators.filter(
    (validator) =>
      validator.identity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validator.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validatorElements = filteredValidators.map((validator) => {
    const isSelected = selectedValidators.includes(validator.address);
    return (
      <div
        key={validator.address}
        className="flex !items-center !justify-between"
      >
        <div className="flex !items-center gap-1">
          <CheckBox
            isChecked={isSelected}
            onChange={() => {
              if (isSelected) {
                setSelectedValidators(
                  selectedValidators.filter(
                    (selectedValidator) =>
                      selectedValidator !== validator.address
                  )
                );
              } else {
                setSelectedValidators([
                  ...selectedValidators,
                  validator.address,
                ]);
              }
            }}
          />
          <Avatar value={validator.address} theme="substrate" />
          <Typography variant="h5" fw="bold">
            {validator.identity !== ''
              ? shortenString(validator.identity, 10)
              : shortenString(validator.address, 6)}
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <Chip color="blue">{validator.effectiveAmountStaked}</Chip>
          <Chip color="green">{validator.delegations}</Chip>
          <CopyWithTooltip
            textToCopy={validator.address}
            isButton={false}
            className="cursor-pointer"
          />
        </div>
      </div>
    );
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

      <div className="flex gap-3 items-center my-4">
        <Typography
          variant="body1"
          fw="normal"
          className="text-mono-200 dark:text-mono-0"
        >
          Sort by :
        </Typography>

        <div className="flex gap-2 items-center">
          {sortBy.map((sortButton) => (
            <SortButton
              key={sortButton.key}
              title={sortButton.title}
              isSelected={selectedSort === sortButton.key}
              onClick={() => {
                if (selectedSort === sortButton.key) {
                  setSelectedSort(undefined);
                } else {
                  setSelectedSort(sortButton.key);
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-h-[348px] overflow-scroll flex flex-col gap-2 p-3 border dark:border-mono-160">
        {validatorElements}
      </div>
    </div>
  );
};

const SortButton = ({
  title,
  isSelected,
  onClick: setIsSelected,
}: SortButtonProps) => {
  return (
    <div
      className={twMerge(
        `flex items-center gap-1 border border-mono-200 dark:border-mono-0 py-1 px-3 rounded-full cursor-pointer ${
          isSelected
            ? 'bg-mono-200 dark:bg-mono-0'
            : 'bg-mono-0 dark:bg-mono-180'
        }`
      )}
      onClick={() => setIsSelected()}
    >
      <Typography
        variant="body1"
        fw="normal"
        className={
          isSelected
            ? 'text-mono-0 dark:text-mono-200'
            : 'text-mono-200 dark:text-mono-0'
        }
      >
        {title}
      </Typography>
      {isSelected && (
        <CloseCircleLineIcon
          className="stroke-mono-0 fill-mono-0 dark:fill-mono-180 dark:stroke-mono-180"
          size="md"
        />
      )}
    </div>
  );
};
