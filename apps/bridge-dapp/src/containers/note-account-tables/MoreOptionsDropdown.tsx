import {
  DeleteBinIcon,
  Download,
  ThreeDotsVerticalIcon,
} from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  DropdownMenuItem,
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
      <DropdownBody className="radix-side-top:mb-3 radix-side-bottom:mt-3">
        <DropdownMenuItem
          onClick={onDownloadNotes}
          rightIcon={<Download size="lg" />}
        >
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDeleteNotes}
          rightIcon={<DeleteBinIcon size="lg" />}
        >
          Delete
        </DropdownMenuItem>
      </DropdownBody>
    </Dropdown>
  );
};
