import { BasicAccountInfo } from '.';

export type Blueprint = {
  id: string;
  name: string;
  author: string;
  imgUrl: string;
  category: BlueprintCategory;
  description: string;
  restakersCount: number;
  operatorsCount: number;
  tvl: string;
  isBoosted?: boolean;
  githubUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  email?: string;
};

export enum BlueprintCategory {
  CATEGORY_1 = 'Category 1',
  CATEGORY_2 = 'Category 2',
  CATEGORY_3 = 'Category 3',
}

export type Operator = BasicAccountInfo & {
  restakersCount: number;
  concentration: number;
  liquidity: {
    amount: number; // NOTE: put as number for faster UI development, might need to update later
    usdValue: number; // NOTE: put as number for faster UI development, might need to update later
  };
  vaults: string[]; // NOTE: put as string for faster UI development, might need to update later
};
