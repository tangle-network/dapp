export type TitleType =
  | 'Validators'
  | 'Waiting'
  | `Active/Nominators`
  | 'Ideal Staked'
  | 'Inflation';

export interface KeyStatsItemProps {
  title: TitleType;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  className?: string;
}
