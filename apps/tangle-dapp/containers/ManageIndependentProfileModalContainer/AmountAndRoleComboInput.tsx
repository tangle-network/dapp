import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '@webb-tools/icons';
import {
  Chip,
  Dropdown,
  DropdownBody,
  Input,
  InputWrapper,
  Label,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';

export type AmountAndRoleComboInputProps = {
  title: string;
  id: string;
};

const AmountAndRoleComboInput: FC<AmountAndRoleComboInputProps> = ({
  title,
  id,
}) => {
  const [amount, setAmount] = useState('');

  return (
    <InputWrapper className="flex gap-2 dark:bg-mono-160 cursor-default">
      <div className="flex flex-col gap-1 mr-auto">
        <Label className="dark:text-mono-80 font-bold" htmlFor={id}>
          {title}
        </Label>

        <Input
          id={id}
          className="placeholder:text-mono-0 text-mono-200 max-w-[190px]"
          value={amount}
          type="number"
          inputMode="numeric"
          onChange={(amount) => setAmount(amount)}
          placeholder={`0 ${TANGLE_TOKEN_UNIT}`}
          size="sm"
          autoComplete="off"
          min={0}
        />
      </div>

      <Dropdown>
        <DropdownTrigger>
          <div className="flex gap-1 cursor-pointer">
            <Chip color="grey" className="uppercase dark:bg-mono-140">
              Select Role
            </Chip>

            <ChevronDown size="lg" />
          </div>
        </DropdownTrigger>

        <DropdownBody>This is a test.</DropdownBody>
      </Dropdown>
    </InputWrapper>
  );
};

export default AmountAndRoleComboInput;
