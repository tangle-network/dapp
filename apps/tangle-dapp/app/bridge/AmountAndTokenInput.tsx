'use client';

import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import DropdownButton from '@webb-tools/webb-ui-components/components/buttons/DropdownButton';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC } from 'react';

import AmountInput from '../../components/AmountInput/AmountInput';
import { useBridge } from '../../context/BridgeContext';

const AmountAndTokenInput: FC = () => {
  const { amount, setAmount, selectedToken, setSelectedToken, tokenOptions } =
    useBridge();

  return (
    <div className="flex items-center gap-2 bg-mono-20 dark:bg-mono-160 rounded-lg pr-4">
      <AmountInput
        id="bridge-amount-input"
        title="Amount"
        amount={amount}
        setAmount={setAmount}
        baseInputOverrides={{
          isFullWidth: true,
        }}
        placeholder=""
        wrapperClassName="!pr-0"
      />
      <Dropdown>
        <DropdownTrigger asChild>
          <DropdownButton
            value={selectedToken.symbol}
            status="success"
            className="w-full bg-mono-20 dark:bg-mono-160 border-0 px-2"
            iconType="token"
          />
        </DropdownTrigger>
        <DropdownBody>
          <ScrollArea className="max-h-[300px]">
            <ul>
              {tokenOptions.map((token) => {
                return (
                  <li key={token.id}>
                    <MenuItem
                      startIcon={<TokenIcon size="lg" name={token.symbol} />}
                      onSelect={() => setSelectedToken(token)}
                    >
                      {token.symbol}
                    </MenuItem>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </DropdownBody>
      </Dropdown>
    </div>
  );
};

export default AmountAndTokenInput;
