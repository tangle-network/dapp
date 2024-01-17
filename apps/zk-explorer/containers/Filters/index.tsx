import { Close } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import assert from 'assert';
import { cloneDeep } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { fetchFilterOptions } from '../../api/filters';
import { IS_DEBUG_MODE } from '../../constants';
import { MOCK_CATEGORIES } from '../../constants/mock';
import { useFilterConstraints } from '../../hooks/useFilterConstraints';
import FilterCheckboxItem from './FilterCheckboxItem';
import { FilterCategoryItem, FilterConstraints } from './types';

export type FiltersProps = PropsOf<'div'> & {
  hasCloseButton?: boolean;
  onClose?: () => void;
  onConstraintsChange: (constraints: FilterConstraints) => void;
};

const Filters: FC<FiltersProps> = ({
  className,
  hasCloseButton,
  onConstraintsChange,
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
      .catch((error) => {
        // If in debug mode, use mock data if the API call fails.
        if (IS_DEBUG_MODE) {
          setCategories(MOCK_CATEGORIES);
        } else {
          throw error;
        }
      });
  }, []);

  const handleOptionCheckboxChange = useCallback(
    (isChecked: boolean, category: string, label: string) => {
      const updatedConstraints: FilterConstraints = cloneDeep(constraints);

      if (!(category in updatedConstraints)) {
        updatedConstraints[category] = [];
      }

      if (isChecked) {
        updatedConstraints[category].push(label);
      } else {
        updatedConstraints[category].splice(
          updatedConstraints[category].indexOf(label),
          1
        );
      }

      onConstraintsChange(updatedConstraints);
      setConstraints(updatedConstraints);
    },
    [constraints, onConstraintsChange, setConstraints]
  );

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
            {category.options.map((option, index) => (
              <FilterCheckboxItem
                key={index}
                category={category.category}
                label={option.label}
                amount={option.amount}
                handleChange={handleOptionCheckboxChange}
                isChecked={
                  constraints[category.category]?.includes(option.label) ??
                  false
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Filters;
