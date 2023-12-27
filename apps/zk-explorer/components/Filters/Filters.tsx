import { FC, useEffect, useState } from 'react';
import { Typography, CheckBox } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { cloneDeep } from 'lodash';
import {
  FilterCategory,
  FilterCategoryItem,
  FilterConstraints,
  FilterOptionItem,
} from './types';
import { SmallChip } from '../SmallChip';
import { twMerge } from 'tailwind-merge';
import assert from 'assert';
import { Close } from '@webb-tools/icons';

export type FiltersProps = PropsOf<'div'> & {
  onConstraintsChange: (constraints: FilterConstraints) => void;
  hasCloseButton?: boolean;
  onClose?: () => void;
};

export const Filters: FC<FiltersProps> = ({
  onConstraintsChange,
  className,
  hasCloseButton,
  onClose,
  ...rest
}) => {
  assert(
    hasCloseButton ? onClose !== undefined : onClose === undefined,
    'If `hasCloseButton` is true, `onClose` must be defined, and vice versa.'
  );

  const [constraints, setConstraints] = useState<FilterConstraints>({
    [FilterCategory.ProofSystem]: [],
    [FilterCategory.Categories]: [],
    [FilterCategory.License]: [],
    [FilterCategory.LanguageOrFramework]: [],
  });

  // TODO: These are only for testing purposes. Remove these once the actual data is available.
  const mockProofSystemsOptions: FilterOptionItem[] = [
    {
      label: 'Circom',
      amount: 403,
    },
    {
      label: 'Plonk',
      amount: 123,
    },
    {
      label: 'Halo2',
      amount: 234,
    },
    {
      label: 'Bulletproof',
      amount: 43,
    },
    {
      label: 'Stark',
      amount: 78,
    },
  ];

  const mockCategoryOptions: FilterOptionItem[] = [
    {
      label: 'Identity Verification',
      amount: 59,
    },
    {
      label: 'Private Transaction',
      amount: 290,
    },
    {
      label: 'Voting System',
      amount: 12,
    },
    {
      label: 'Arithmetic',
      amount: 90,
    },
    {
      label: 'Cryptography',
      amount: 183,
    },
  ];

  const mockLicenseOptions: FilterOptionItem[] = [
    {
      label: 'MIT',
      amount: 392,
    },
    {
      label: 'GPLv3',
      amount: 19,
    },
    {
      label: 'Apache 2.0',
      amount: 128,
    },
  ];

  const mockLanguageOptions: FilterOptionItem[] = [
    {
      label: 'TypeScript',
      amount: 410,
    },
    {
      label: 'C++',
      amount: 319,
    },
    {
      label: 'Rust',
      amount: 593,
    },
    {
      label: 'Circom',
      amount: 478,
    },
    {
      label: 'Solidity',
      amount: 92,
    },
    {
      label: 'JavaScript',
      amount: 228,
    },
  ];

  const categories: FilterCategoryItem[] = [
    {
      category: FilterCategory.ProofSystem,
      options: mockProofSystemsOptions,
    },
    {
      category: FilterCategory.Categories,
      options: mockCategoryOptions,
    },
    {
      category: FilterCategory.License,
      options: mockLicenseOptions,
    },
    {
      category: FilterCategory.LanguageOrFramework,
      options: mockLanguageOptions,
    },
  ];

  useEffect(() => {
    onConstraintsChange(constraints);

    // Under no circumstances should the `onConstraintsChange` prop
    // function be called if the constraints themselves have not changed;
    // therefore, `onConstraintsChange` should not be included in the
    // effect's dependency array.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constraints]);

  const handleConstraintChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: FilterCategory,
    label: string
  ) => {
    const updatedConstraints: FilterConstraints = cloneDeep(constraints);

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
            {mockProofSystemsOptions.map((option) => (
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
