import { ChevronDown } from '@webb-tools/icons';
import { type FC } from 'react';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '../Dropdown/index.js';
import { MenuItem } from '../MenuItem/index.js';
import Button from '../buttons/Button.js';
import { ManageButtonProps } from './types.js';

const ActionsDropdown: FC<ManageButtonProps> = ({
  buttonText,
  actionItems,
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
          {buttonText}
        </Button>
      </DropdownBasicButton>

      <DropdownBody className="min-w-[200px]" size="sm">
        {actionItems.map(({ label, icon, onClick }, idx) => (
          <MenuItem key={idx} onClick={onClick} icon={icon}>
            {label}
          </MenuItem>
        ))}
      </DropdownBody>
    </Dropdown>
  );
};

export default ActionsDropdown;
