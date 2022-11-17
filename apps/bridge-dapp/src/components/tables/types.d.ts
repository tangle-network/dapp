import { Button, MenuItem } from '@webb-tools/webb-ui-components';
import { ComponentProps } from 'react';

export interface ManageButtonProps {
  /**
   * Callback when upload menu item is clicked
   */
  onUpload?: ComponentProps<typeof MenuItem>['onClick'];

  /**
   * Callback when download menu item is clicked
   */
  onDownload?: ComponentProps<typeof MenuItem>['onClick'];
}

export interface EmptyTableProps {
  /**
   * The empty table title
   */
  title: string;

  /**
   * The empty table description
   */
  description: string;

  /**
   * The empty table button text
   */
  buttonText: string;

  /**
   * The callback when user hit the link
   */
  onClick?: ComponentProps<typeof Button>['onClick'];
}
