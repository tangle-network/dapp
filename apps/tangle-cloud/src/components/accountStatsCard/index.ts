import { AccountStatsCardHeader } from './AccountStatsCardHeader';
import { AccountStatsCardBody } from './AccountStatsCardBody';
import TangleCloudCard from '../TangleCloudCard';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';

const AccountStatsDetailCard = Object.assign(
  {},
  {
    Root: TangleCloudCard,
    Header: AccountStatsCardHeader,
    Body: AccountStatsCardBody,
  },
);

type AccountStatsCardHeaderProps = ComponentProps<'div'> & {
  IconElement?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  descExternalLink?: string;
  RightElement?: ReactNode;
};

type AccountStatsCardBodyProps = PropsWithChildren<{
  className?: string;
  socialLinks?: Array<{ name?: string; href: string }>;

  statsItems?: Array<{
    title: string | ReactNode;
    tooltip?: string | ReactNode;
    className?: string;
    children: ReactNode | null;
    isError?: boolean;
  }>;
}>;

type AccountStatsCardProps = {
  rootProps?: ComponentProps<typeof AccountStatsDetailCard.Root>;
  headerProps?: AccountStatsCardHeaderProps;
  bodyProps?: AccountStatsCardBodyProps;
};

export type {
  AccountStatsCardHeaderProps,
  AccountStatsCardBodyProps,
  AccountStatsCardProps,
};

export default AccountStatsDetailCard;
