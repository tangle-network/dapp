import type { OperatorData } from '../components/tables/Operators/types';

export type Blueprint = {
  id: string;
  name: string;
  author: string;
  imgUrl: string | null;
  category: string | null;
  description: string | null;
  restakersCount: number | null;
  operatorsCount: number | null;
  tvl: string | null;
  isBoosted?: boolean;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
};

export type Operator = OperatorData;
