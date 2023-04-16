import { IconBase } from '@webb-tools/icons/types';

type LinksType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
  description: string;
};

export type WebsiteCommunityProps = {
  links: LinksType[];
  cardContainerClassName?: string;
  cardClassName?: string;
};
