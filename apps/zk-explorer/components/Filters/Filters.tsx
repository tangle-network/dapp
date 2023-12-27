'use client';

import { FC, useEffect, useState } from 'react';
import { Typography, CheckBox } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { cloneDeep } from 'lodash';
import { FilterCategoryItem, FilterConstraints } from './types';
import { SmallChip } from '../SmallChip';
import { twMerge } from 'tailwind-merge';
import assert from 'assert';
import { Close } from '@webb-tools/icons';
import { fetchFilterOptions } from '../../utils/api';
import { MOCK_CATEGORIES } from '../../utils/constants';
import { useFilterConstraints } from '../../hooks/useFilterConstraints';

export type FiltersProps = PropsOf<'div'> & {
  hasCloseButton?: boolean;
  onClose?: () => void;
};

export const Filters: FC<FiltersProps> = ({
  className,
  hasCloseButton,
  onClose,
  ...rest
}) => {
  assert(
    hasCloseButton ? onClose !== undefined : onClose === undefined,
    'If `hasCloseButton` is true, `onClose` must be defined, and vice versa.'
  );

  const [constraints, setConstraints] = useFilterConstraints();
  const [categories, setCategories] = useState<FilterCategoryItem[]>([]);

  // Fetch categories and options from API.
  useEffect(() => {
    fetchFilterOptions()
      .then((responseData) => setCategories(responseData.categories))
      // TODO: Temporarily use mock data until we have a backend.
      .catch(() => setCategories(MOCK_CATEGORIES));
  }, []);

  const handleConstraintChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string,
    label: string
  ) => {
    const updatedConstraints: FilterConstraints = cloneDeep(constraints);

    if (!(category in updatedConstraints)) {
      updatedConstraints[category] = [];
    }

    if (e.target.checked) {
      updatedConstraints[category].push(label);
    } else {
      updatedConstraints[category].splice(
        updatedConstraints[category].indexOf(label),
        1
      );
    }

    setConstraints(updatedConstraints);
  };

  return (
    <div {...rest} className={twMerge('flex flex-col gap-9', className)}>
      <div>
        <div className="flex items-center">
          <Typography variant="h5" fw="bold" className="py-2 dark:text-mono-0">
            Filter by:
          </Typography>

          {hasCloseButton && (
            <Close
              onClick={onClose}
              size="lg"
              className="ml-auto cursor-pointer"
            />
          )}
        </div>

        <hr className="border-mono-160" />
      </div>

      {categories.map((category) => (
        <div key={category.category}>
          <Typography
            variant="body1"
            fw="normal"
            className="mb-6 dark:text-mono-0"
          >
            {category.category}
          </Typography>

          <div className="flex flex-col gap-2">
            {category.options.map((option) => (
              <div key={option.label} className="flex">
                <CheckBox
                  wrapperClassName="items-center"
                  spacingClassName="ml-2"
                  onChange={(e) =>
                    handleConstraintChange(e, category.category, option.label)
                  }
                >
                  {option.label}
                </CheckBox>

                <SmallChip className="ml-auto">{option.amount}</SmallChip>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
