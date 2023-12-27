import {
  FilterCategoryItem,
  FilterOptionItem,
} from '../components/Filters/types';

export const MOCK_PROOF_SYSTEMS_OPTIONS: FilterOptionItem[] = [
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

export const MOCK_CATEGORY_OPTION: FilterOptionItem[] = [
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

export const MOCK_LICENSE_OPTIONS: FilterOptionItem[] = [
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

export const MOCK_CATEGORIES: FilterCategoryItem[] = [
  {
    category: 'Proof system',
    options: MOCK_PROOF_SYSTEMS_OPTIONS,
  },
  {
    category: 'Categories',
    options: MOCK_PROOF_SYSTEMS_OPTIONS,
  },
  {
    category: 'License',
    options: MOCK_PROOF_SYSTEMS_OPTIONS,
  },
  {
    category: 'Language/Framework',
    options: MOCK_PROOF_SYSTEMS_OPTIONS,
  },
];

export const MOCK_LANGUAGE_OPTIONS: FilterOptionItem[] = [
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
