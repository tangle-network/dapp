import type { ComponentProps } from 'react';
import type { IconBase } from '@webb-tools/icons/types';
import { InternalOrExternalLink } from '../Navbar/InternalOrExternalLink';

export type WebsiteType = 'webb' | 'tangle';

export type SocialType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
};

export type NavLinkType = {
  group: string;
  links: Array<
    ComponentProps<typeof InternalOrExternalLink> & { label: string }
  >;
};

export interface WebbFooterProps {
  websiteType?: WebsiteType;
  hideNewsletter?: boolean;
}
