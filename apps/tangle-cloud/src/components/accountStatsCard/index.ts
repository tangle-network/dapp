import { AccountStatsCardHeader } from './AccountStatsCardHeader';
import { AccountStatsCardBody } from './AccountStatsCardBody';
import TangleCloudCard from '../TangleCloudCard';
import { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { SocialsProps } from '@tangle-network/ui-components/components/Socials/types';

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
  location?: string;
  totalRestake?: string;
  restakers?: string;
  socialLinks?: SocialsProps['socialConfigs'];
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
