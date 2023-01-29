import {
  DeleteBinIcon,
  Download,
  ThreeDotsVerticalIcon,
} from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { MoreOptionsDropdownProps } from './types';

export const MoreOptionsDropdown: FC<MoreOptionsDropdownProps> = ({
  onDeleteNotes,
  onDownloadNotes,
}) => {
  return (
    <Dropdown>
      <DropdownBasicButton className="flex items-center justify-center">
        <ThreeDotsVerticalIcon size="lg" />
      </DropdownBasicButton>
      <DropdownBody className="mt-3">
        <MenuItem onClick={onDownloadNotes} icon={<Download size="lg" />}>
          Download
        </MenuItem>
        <MenuItem onClick={onDeleteNotes} icon={<DeleteBinIcon size="lg" />}>
          Delete
        </MenuItem>
      </DropdownBody>
    </Dropdown>
  );
};
