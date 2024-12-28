import {
  randBoolean,
  randCompanyName,
  randEmail,
  randNumber,
  randProductDescription,
  randUrl,
  randUserName,
} from '@ngneat/falso';
import { Blueprint } from '../../../types/blueprint';

const categories = [
  'Bridge',
  'ZK',
  'AI',
  'MPC',
  'Distributed Validator',
  'Web Service',
  'Rollup',
  'Eigenlayer',
  'Symbiotic',
];

const githubRepos = [
  'dapp',
  'tangle',
  'gadget-workspace',
  'gadget',
  'tls-notary-blueprint',
  'raas-blueprints',
  'obol-dvt-blueprint',
  'hyperbridge-relayer-blueprint',
];

export default function randBlueprint(id: string) {
  return {
    id,
    name: randCompanyName(),
    author: randUserName(),
    imgUrl: 'https://picsum.photos/600',
    category: categories[randNumber({ min: 0, max: categories.length - 1 })],
    description: randProductDescription(),
    restakersCount: randNumber({ min: 1, max: 50 }),
    operatorsCount: randNumber({ min: 1, max: 50 }),
    tvl: `$${randNumber({ min: 100, max: 1000000 }).toLocaleString()}`,
    isBoosted: randBoolean(),
    githubUrl: `https://github.com/tangle-network/${githubRepos[randNumber({ min: 0, max: githubRepos.length - 1 })]}`,
    websiteUrl: randUrl(),
    twitterUrl: `https://twitter.com/${randUserName()}`,
    email: randEmail(),
  } satisfies Blueprint;
}
