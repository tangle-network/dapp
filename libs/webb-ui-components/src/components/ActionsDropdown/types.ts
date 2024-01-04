import { MenuItem } from '../../components';
import { type ComponentProps } from 'react';

export type ActionItemType = {
  label: string;
  icon?: React.ReactElement;
  onClick: ComponentProps<typeof MenuItem>['onClick'];
};

export interface ManageButtonProps {
  buttonText: string;
  actionItems: ActionItemType[];
}
