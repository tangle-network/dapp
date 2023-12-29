import { FC, useEffect, useState } from 'react';
import { Typography, CheckBox, Chip } from '@webb-tools/webb-ui-components';
import { cloneDeep } from 'lodash';
import {
  FilterCategory,
  FilterCategoryItem,
  FilterConstraints,
  FilterOptionItem,
  type SidebarFiltersProps,
} from './types';

export const SidebarFilters: FC<SidebarFiltersProps> = ({
  onConstraintsChange,
}) => {
  const [constraints, setConstraints] = useState<FilterConstraints>({
    [FilterCategory.ProofSystem]: [],
    [FilterCategory.Categories]: [],
    [FilterCategory.License]: [],
    [FilterCategory.LanguageOrFramework]: [],
  });

  // TODO: These are only for testing purposes. Remove these once the actual data is available.
  const debugProofSystemsOptions: FilterOptionItem[] = [
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

  const debugCategoryOptions: FilterOptionItem[] = [
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

  const debugLicenseOptions: FilterOptionItem[] = [
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

  const debugLanguageOptions: FilterOptionItem[] = [
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
      options: debugProofSystemsOptions,
    },
    {
      category: FilterCategory.Categories,
      options: debugCategoryOptions,
    },
    {
      category: FilterCategory.License,
      options: debugLicenseOptions,
    },
    {
      category: FilterCategory.LanguageOrFramework,
      options: debugLanguageOptions,
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
    <div className="flex flex-col gap-9">
      <div>
        <Typography variant="h5" fw="bold" className="py-2 dark:text-mono-0">
          Filter by:
        </Typography>
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
            {debugProofSystemsOptions.map((option) => (
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

                <Chip color="grey" className="ml-auto bg-mono-140 px-2">
                  {option.amount}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
