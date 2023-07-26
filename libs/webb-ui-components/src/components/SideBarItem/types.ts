import { IconBase } from '@webb-tools/icons/types';

export type SideBarItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  subItems: SideBarSubItemProps[];
};

export type SideBarExtraItemProps = {
  isSidebarOpen?: boolean;
  isActive?: boolean;
  setIsActive?: () => void;
};

export type SideBarSubItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
};

export type SideBarExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};
