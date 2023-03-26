import {
  Dropdown,
  DropdownBasicButton,
  TokenInput,
} from '@webb-tools/webb-ui-components';
import React from 'react';

const TokenDropdown = () => {
  return (
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton isFullWidth>
        <TokenInput />
      </DropdownBasicButton>
    </Dropdown>
  );
};

export default TokenDropdown;
