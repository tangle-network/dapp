import { ChevronDown } from '@webb-tools/icons';
import {
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { type FC, type ComponentProps } from 'react';

type ActionItemType = {
  label: string;
  icon: React.ReactElement;
  onClick: ComponentProps<typeof MenuItem>['onClick'];
};

interface ManageButtonProps {
  buttonText: string;
  actionItems: ActionItemType[];
}

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
        {actionItems.map(({ label, icon, onClick }) => (
          <MenuItem onClick={onClick} icon={icon}>
            {label}
          </MenuItem>
        ))}
      </DropdownBody>
    </Dropdown>
  );
};

export default ActionsDropdown;
