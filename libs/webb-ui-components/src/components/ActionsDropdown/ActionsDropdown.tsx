import { ChevronDown } from '@webb-tools/icons';
import { type FC } from 'react';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  DropdownMenuItem,
} from '../Dropdown';
import Button from '../buttons/Button';
import { ManageButtonProps } from './types';

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
          <DropdownMenuItem key={idx} onClick={onClick} rightIcon={icon}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownBody>
    </Dropdown>
  );
};

export default ActionsDropdown;
