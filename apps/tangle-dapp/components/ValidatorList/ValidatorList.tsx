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
import React, { FC, useCallback, useMemo, useState } from 'react';

import { Validator } from '../../types';
import {
  SortableValidatorKeys,
  SortButtonProps,
  ValidatorListProps,
} from './types';

export const ValidatorList: FC<ValidatorListProps> = ({
  validators,
  selectedValidators,
  setSelectedValidators,
  sortBy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSortBy, setSelectedSortBy] =
    useState<keyof SortableValidatorKeys>();

  const sortedValidators = useMemo(() => {
    if (selectedSortBy !== undefined) {
      return validators.toSorted((a, b) => {
        const valueA = parseInt(a[selectedSortBy], 10);
        const valueB = parseInt(b[selectedSortBy], 10);

        return valueB - valueA;
      });
    } else {
      return validators.toSorted((a, b) => {
        const aSelected = selectedValidators.includes(a.address);
        const bSelected = selectedValidators.includes(b.address);

        return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
      });
    }
  }, [selectedSortBy, selectedValidators, validators]);

  const filteredValidators = useMemo(
    () =>
      sortedValidators.filter(
        (validator) =>
          validator.identityName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          validator.address.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, sortedValidators]
  );

  const handleValidatorToggle = useCallback(
    (address: string, isSelected: boolean) => {
      if (isSelected) {
        setSelectedValidators(
          selectedValidators.filter(
            (selectedValidator) => selectedValidator !== address
          )
        );
      } else {
        setSelectedValidators([...selectedValidators, address]);
      }
    },
    [selectedValidators, setSelectedValidators]
  );

  const validatorElements = useMemo(
    () =>
      filteredValidators.map((validator) => {
        const isSelected = selectedValidators.includes(validator.address);

        return (
          <ValidatorCell
            key={validator.address}
            isSelected={isSelected}
            onToggleSelection={handleValidatorToggle}
            {...validator}
          />
        );
      }),
    [filteredValidators, handleValidatorToggle, selectedValidators]
  );

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
              isSelected={selectedSortBy === sortButton.key}
              onClick={() => {
                if (selectedSortBy === sortButton.key) {
                  setSelectedSortBy(undefined);
                } else {
                  setSelectedSortBy(sortButton.key);
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="max-h-[348px] overflow-scroll flex flex-col gap-2 p-3 border dark:border-mono-160 col-span-2">
          {validatorElements}
        </div>

        <div className="flex flex-col gap-5 col-span-1">
          <Typography variant="body1" fw="normal">
            Validators can be nominated from the list of all currently available
            validators. You should nominate validators you trust. Nominators are
            slashed when their nominated validators misbehave.
          </Typography>

          <Typography variant="body1" fw="normal">
            Once submitted, the new selection will only take effect in 2 eras
            from the next validator election cycle. Until then, the nominations
            will appear inactive.
          </Typography>

          <Typography variant="body1" fw="normal">
            Submitting a new nomination will overwrite any existing nomination.
          </Typography>
        </div>
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
    <Chip
      onClick={() => setIsSelected()}
      color={isSelected ? 'blue' : 'grey'}
      isSelected
      className="cursor-pointer"
    >
      {title}
      {isSelected && (
        <CloseCircleLineIcon
          className="stroke-blue-90 fill-blue-90 dark:fill-blue-30 dark:stroke-blue-30"
          size="md"
        />
      )}
    </Chip>
  );
};

/** @internal */
const ValidatorCell: FC<
  Validator & {
    isSelected: boolean;
    onToggleSelection: (address: string, isSelected: boolean) => void;
  }
> = ({
  isSelected,
  address,
  identityName,
  delegations,
  status,
  commission,
  effectiveAmountStaked,
  onToggleSelection,
}) => {
  return (
    <div className="flex !items-center !justify-between">
      <div className="flex !items-center gap-1">
        <CheckBox
          isChecked={isSelected}
          onChange={() => onToggleSelection(address, isSelected)}
        />

        <Avatar value={address} theme="substrate" />

        <Typography variant="h5" fw="bold">
          {identityName !== ''
            ? shortenString(identityName, 8)
            : shortenString(address, 8)}
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <Chip color="blue">{effectiveAmountStaked}</Chip>

        <Chip color="blue">{delegations}</Chip>

        <Chip color="blue">{commission}%</Chip>

        <Chip color={status === 'Active' ? 'green' : 'yellow'}>{status}</Chip>

        <CopyWithTooltip
          textToCopy={address}
          isButton={false}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};
