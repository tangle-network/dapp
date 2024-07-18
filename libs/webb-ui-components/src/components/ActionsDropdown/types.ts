import type { MenuItemProps } from '../MenuItems/types';

export type ActionItemType = {
  label: string;
  icon?: React.ReactElement;
  onClick: MenuItemProps['onClick'];
};

export interface ManageButtonProps {
  buttonText: string;
  actionItems: ActionItemType[];
}
