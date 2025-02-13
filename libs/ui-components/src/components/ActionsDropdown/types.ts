import type { DropdownMenuItemProps } from '../Dropdown/types';

export type ActionItemType = {
  label: string;
  icon?: React.ReactElement;
  onClick: DropdownMenuItemProps['onClick'];
};

export interface ManageButtonProps {
  buttonText: string;
  actionItems: ActionItemType[];
}
