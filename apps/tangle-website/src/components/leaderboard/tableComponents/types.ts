export type BadgeType =
  | 'creator'
  | 'developer'
  | 'governance'
  | 'innovator'
  | 'relayer'
  | 'validator'
  | 'specialist';

export type RankingItemType = {
  address: string;
  badges: BadgeType[];
  points: number;
};
