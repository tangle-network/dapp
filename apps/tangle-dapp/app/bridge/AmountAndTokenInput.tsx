'use client';

import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import ChainOrTokenButton from '@webb-tools/webb-ui-components/components/buttons/ChainOrTokenButton';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';

import AmountInput from '../../components/AmountInput/AmountInput';
import { BRIDGE_SUPPORTED_TOKENS } from '../../constants/bridge';
import { useBridge } from '../../context/BridgeContext';
import convertDecimalToBn from '../../utils/convertDecimalToBn';
import useBalance from './hooks/useBalance';
import useMinAmount from './hooks/useMinAmount';
import useSelectedToken from './hooks/useSelectedToken';
import useDecimals from './hooks/useDecimals';

const AmountAndTokenInput: FC = () => {
  const {
    amount,
    setAmount,
    setSelectedTokenId,
    tokenIdOptions,
    setIsInputError,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const { balance, isLoading } = useBalance();
  const decimals = useDecimals();
  const minAmount = useMinAmount();

  return (
    <div className="relative">
      <div className="w-full flex items-center gap-2 bg-mono-20 dark:bg-mono-160 rounded-lg pr-4">
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
          max={balance ? convertDecimalToBn(balance, decimals) : null}
          maxErrorMessage="Insufficient balance"
          min={minAmount ? convertDecimalToBn(minAmount, decimals) : null}
          minErrorMessage="Amount too small"
          setErrorMessage={() => setIsInputError(true)}
        />
        <Dropdown>
          <DropdownTrigger asChild>
            <ChainOrTokenButton
              value={selectedToken.symbol}
              status="success"
              className="w-[130px] bg-mono-0 dark:bg-mono-140 border-0 px-3"
              iconType="token"
            />
          </DropdownTrigger>
          <DropdownBody className="border-0 w-[119px] min-w-fit mr-[11px]">
            <ScrollArea className="max-h-[300px] w-[130px]">
              <ul>
                {tokenIdOptions.map((tokenId) => {
                  const token = BRIDGE_SUPPORTED_TOKENS[tokenId];
                  return (
                    <li key={tokenId}>
                      <MenuItem
                        startIcon={<TokenIcon size="lg" name={token.symbol} />}
                        onSelect={() => setSelectedTokenId(tokenId)}
                        className="px-3 normal-case"
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

      {isLoading ? (
        <SkeletonLoader
          size="md"
          className="w-[100px] absolute right-0 bottom-[-24px]"
        />
      ) : (
        <Typography
          variant="body2"
          className="absolute right-0 bottom-[-24px] text-mono-120 dark:text-mono-100"
        >
          Balance:{' '}
          {balance !== null
            ? `${balance.toString()} ${selectedToken.symbol}`
            : 'N/A'}
        </Typography>
      )}
    </div>
  );
};

export default AmountAndTokenInput;
