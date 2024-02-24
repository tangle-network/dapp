import { BN } from '@polkadot/util';
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
import { ChangeEvent, FC, useState } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import { ServiceType } from '../../types';

export type AmountAndRoleComboInputProps = {
  role: ServiceType | null;
  title: string;
  id: string;
  onChange?: (newAmount: BN) => void;
  setRole: (role: ServiceType) => void;
};

const AmountAndRoleComboInput: FC<AmountAndRoleComboInputProps> = ({
  title,
  id,
  onChange,
  role,
  setRole,
}) => {
  const [amount, setAmount] = useState('');

  const handleAmountChange = (newValue: string) => {
    setAmount(newValue);

    if (onChange) {
      onChange(new BN(newValue));
    }
  };

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
          onChange={handleAmountChange}
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
