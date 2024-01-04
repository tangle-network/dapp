import { PropsOf } from '@webb-tools/webb-ui-components/types';

export type FilterOptionItem = {
  label: string;
  amount: number;
};

export type FilterCategoryItem = {
  category: FilterCategory;
  options: FilterOptionItem[];
};

export enum FilterCategory {
  ProofSystem = 'Proof system',
  Categories = 'Categories',
  License = 'License',
  LanguageOrFramework = 'Language/Framework',
}

export enum ProofSystem {
  Circom = 'Circom',
  Plonk = 'Plonk',
  Halo2 = 'Halo2',
  Bulletproof = 'Bulletproof',
  Stark = 'Stark',
}

export enum ItemCategory {
  IdentityVerification = 'Identity Verification',
  PrivateTransaction = 'Private Transaction',
  VotingSystem = 'Voting System',
  Arithmetic = 'Arithmetic',
  Cryptography = 'Cryptography',
}

export enum License {
  MIT = 'MIT',
  GPLv3 = 'GPLv3',
  Apache2 = 'Apache 2.0',
}

export enum LanguageOrFramework {
  TypeScript = 'TypeScript',
  CPlusPlus = 'C++',
  Rust = 'Rust',
  Circom = 'Circom',
  Solidity = 'Solidity',
  JavaScript = 'JavaScript',
}

export type FilterConstraints = {
  [FilterCategory.ProofSystem]: string[];
  [FilterCategory.Categories]: string[];
  [FilterCategory.License]: string[];
  [FilterCategory.LanguageOrFramework]: string[];
};

export type SidebarFiltersProps = PropsOf<'div'> & {
  onConstraintsChange: (constraints: FilterConstraints) => void;
};
