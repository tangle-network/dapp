import { randomBytes } from 'crypto';
import {
  Location,
  MpcParticipant,
} from '../components/ProofGenerationStepCards/types';
import {
  FilterCategoryItem,
  FilterOptionItem,
} from '../containers/Filters/types';
import { User } from '../hooks/useAuth';

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

export const MOCK_CATEGORY_OPTIONS: FilterOptionItem[] = [
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

export const MOCK_CATEGORIES: FilterCategoryItem[] = [
  {
    category: 'Proof System',
    options: MOCK_PROOF_SYSTEMS_OPTIONS,
  },
  {
    category: 'Categories',
    options: MOCK_CATEGORY_OPTIONS,
  },
  {
    category: 'License',
    options: MOCK_LICENSE_OPTIONS,
  },
  {
    category: 'Language/Framework',
    options: MOCK_LANGUAGE_OPTIONS,
  },
];

export const MOCK_USER: User = {
  id: '0',
  email: 'hello@webb.tools',
  twitterHandle: 'webbprotocol',
  githubUsername: 'webb',
  website: 'https://www.webb.tools/',
  shortBio:
    'An ecosystem of infrastructures and applications designed to extend privacy to the blockchain space.',
  createdAt: new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
  activatedCircuitCount: 0,
};

export const MOCK_MPC_PARTICIPANTS: MpcParticipant[] = Array.from(
  { length: 5 },
  () => ({
    address: randomBytes(20).toString('hex'),
    location: Location.UsWest,
    slashingIncidents: 0,
    uptime: 100,
  })
);

export const MOCK_CIRCUIT_FILE_PATH = 'pairing.circom';
