import { FC } from 'react';
import { Typography, CheckBox, Chip } from '@webb-tools/webb-ui-components';

type FilterOption = {
  label: string;
  amount: number;
};

type FilterCategory = {
  label: string;
  options: FilterOption[];
};

export const FilteringSidebar: FC<unknown> = () => {
  const debugProofSystemsOptions: FilterOption[] = [
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

  const debugCategoryOptions: FilterOption[] = [
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

  const debugLicenseOptions: FilterOption[] = [
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

  const debugLanguageOptions: FilterOption[] = [
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

  const categories: FilterCategory[] = [
    {
      label: 'Proof system',
      options: debugProofSystemsOptions,
    },
    {
      label: 'Category',
      options: debugCategoryOptions,
    },
    {
      label: 'License',
      options: debugLicenseOptions,
    },
    {
      label: 'Language/Framework',
      options: debugLanguageOptions,
    },
  ];

  return (
    <div className="px-6 flex flex-col gap-9 min-w-[270px]">
      <div>
        <Typography variant="body1" fw="semibold" className="py-2">
          Filter by:
        </Typography>
        <hr className="border-mono-160" />
      </div>

      {categories.map((category) => (
        <div key={category.label}>
          <Typography
            variant="body1"
            fw="normal"
            className="mb-6 dark:text-mono-0"
          >
            Proof system
          </Typography>

          <div className="flex flex-col gap-2">
            {debugProofSystemsOptions.map((option) => (
              <div key={option.label} className="flex">
                <CheckBox
                  wrapperClassName="items-center"
                  spacingClassName="ml-2"
                >
                  {option.label}
                </CheckBox>

                <Chip color="grey" className="ml-auto bg-mono-140">
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
