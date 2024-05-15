import type { MenuItemProps } from '../../components/MenuItem/types.js';

export type ActionItemType = {
  label: string;
  icon?: React.ReactElement;
  onClick: MenuItemProps['onClick'];
};

export interface ManageButtonProps {
  buttonText: string;
  actionItems: ActionItemType[];
}
