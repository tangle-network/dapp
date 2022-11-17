import { ChevronDown, Download, UploadCloudIcon } from '@webb-tools/icons';
import {
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { ManageButtonProps } from './types';

export const ManageButton: FC<ManageButtonProps> = ({
  onDownload,
  onUpload,
}) => {
  return (
    <Dropdown>
      <DropdownBasicButton className="group">
        <Button
          as="span"
          variant="utility"
          size="sm"
          rightIcon={
            <ChevronDown className="!fill-current transition-transform duration-300 ease-in-out group-radix-state-open:rotate-180" />
          }
        >
          Manage
        </Button>
      </DropdownBasicButton>

      <DropdownBody className="min-w-[200px]" size="sm">
        <MenuItem onClick={onUpload} icon={<UploadCloudIcon size="lg" />}>
          Upload
        </MenuItem>
        <MenuItem onClick={onDownload} icon={<Download size="lg" />}>
          Download
        </MenuItem>
      </DropdownBody>
    </Dropdown>
  );
};
