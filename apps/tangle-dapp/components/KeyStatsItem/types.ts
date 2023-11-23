export type TitleType = 'Validators' | 'Waiting' | `Active/Delegation`;

export interface KeyStatsItemProps {
  title: TitleType;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  className?: string;
}
