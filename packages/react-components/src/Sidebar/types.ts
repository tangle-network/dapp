import { AppFeatures } from '@webb-dapp/ui-components/types';
import { ReactNode } from 'react';

export interface SideBarItem {
  icon?: ReactNode;
  name?: string;
}

export interface ProductItem extends SideBarItem {
  path?: string;
  requiredFeatures?: Array<AppFeatures>;
  items?: ProductItem[];
}

export interface SocialItem extends SideBarItem {
  href: string;
  rel?: string;
}

export interface SidebarConfig {
  products?: ProductItem[];
  socialPlatforms?: SocialItem[];
}
