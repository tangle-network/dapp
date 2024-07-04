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
import Decimal from 'decimal.js';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import AmountInput from '../../components/AmountInput/AmountInput';
import { BRIDGE_SUPPORTED_TOKENS } from '../../constants/bridge';
import { useBridge } from '../../context/BridgeContext';
import convertDecimalToBn from '../../utils/convertDecimalToBn';
import useBalance from './hooks/useBalance';
import useDecimals from './hooks/useDecimals';
import useSelectedToken from './hooks/useSelectedToken';
import useTypedChainId from './hooks/useTypedChainId';

const AmountAndTokenInput: FC = () => {
  const {
    amount,
    setAmount,
    setSelectedTokenId,
    tokenIdOptions,
    setIsAmountInputError,
    isAmountInputError,
    bridgeFee,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const { balance, isLoading } = useBalance();
  const decimals = useDecimals();
  const { sourceTypedChainId } = useTypedChainId();

  const minAmount = useMemo(() => {
    const existentialDeposit =
      selectedToken.existentialDeposit[sourceTypedChainId];
    const destChainTransactionFee =
      selectedToken.destChainTransactionFee[sourceTypedChainId];

    return (existentialDeposit ?? new Decimal(0))
      .add(destChainTransactionFee ?? new Decimal(0))
      .add(bridgeFee ?? new Decimal(0));
  }, [
    selectedToken.existentialDeposit,
    selectedToken.destChainTransactionFee,
    sourceTypedChainId,
    bridgeFee,
  ]);

  return (
    <div className="relative">
      <div
        className={twMerge(
          'w-full flex items-center gap-2 bg-mono-20 dark:bg-mono-160 rounded-lg pr-4',
          isAmountInputError && 'border border-red-70 dark:border-red-50',
        )}
      >
        <AmountInput
          id="bridge-amount-input"
          title="Amount"
          amount={amount}
          setAmount={setAmount}
          baseInputOverrides={{
            isFullWidth: true,
          }}
          placeholder=""
          wrapperClassName="!pr-0 !border-0"
          max={balance ? convertDecimalToBn(balance, decimals) : null}
          maxErrorMessage="Insufficient balance"
          min={minAmount ? convertDecimalToBn(minAmount, decimals) : null}
          decimals={decimals}
          minErrorMessage="Amount too small"
          setErrorMessage={(error) =>
            setIsAmountInputError(error ? true : false)
          }
          errorMessageClassName="absolute left-0 bottom-[-24px] !text-[14px] !leading-[21px]"
        />
        <Dropdown>
          <DropdownTrigger asChild>
            <ChainOrTokenButton
              value={selectedToken.symbol}
              status="success"
              className={twMerge(
                'w-[130px] border-0 px-3 bg-[#EFF3F6] dark:bg-mono-140',
                'hover:bg-[#EFF3F6] dark:hover:bg-mono-140',
              )}
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
