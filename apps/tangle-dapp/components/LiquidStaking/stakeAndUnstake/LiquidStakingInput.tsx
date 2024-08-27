'use client';

import { BN } from '@polkadot/util';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LS_NETWORKS,
  LST_PREFIX,
} from '../../../constants/liquidStaking/constants';
import {
  LsProtocolId,
  LsProtocolType,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../../containers/ManageProfileModalContainer/Independent/IndependentAllocationInput';
import useInputAmount from '../../../hooks/useInputAmount';
import formatBn from '../../../utils/formatBn';
import getLsProtocolTypeMetadata from '../../../utils/liquidStaking/getLsProtocolMetadata';
import DropdownChevronIcon from './DropdownChevronIcon';
import TokenChip from './TokenChip';

export type LiquidStakingInputProps = {
  id: string;
  protocolId: LsProtocolId;
  decimals: number;
  amount: BN | null;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  token: LsToken;
  isTokenLiquidVariant?: boolean;
  minAmount?: BN;
  maxAmount?: BN;
  maxErrorMessage?: string;
  className?: string;
  onAmountChange?: (newAmount: BN | null) => void;
  setChainId?: (newChain: LsProtocolId) => void;
  onTokenClick?: () => void;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  decimals,
  isReadOnly = false,
  placeholder = '0',
  isTokenLiquidVariant = false,
  rightElement,
  protocolId,
  token,
  minAmount,
  maxAmount,
  maxErrorMessage = ERROR_NOT_ENOUGH_BALANCE,
  onAmountChange,
  setChainId,
  onTokenClick,
  className,
}) => {
  const minErrorMessage = ((): string | undefined => {
    if (minAmount === undefined) {
      return undefined;
    }

    const unit = `${isTokenLiquidVariant ? LST_PREFIX : ''}${token}`;

    const formattedMinAmount = formatBn(minAmount, decimals, {
      fractionMaxLength: undefined,
      includeCommas: true,
    });

    return `Amount must be at least ${formattedMinAmount} ${unit}`;
  })();

  const { displayAmount, handleChange, errorMessage, setDisplayAmount } =
    useInputAmount({
      amount,
      setAmount: onAmountChange,
      decimals,
      min: minAmount,
      minErrorMessage,
      max: maxAmount,
      maxErrorMessage,
    });

  // Update the display amount when the amount prop changes.
  // Only do this for controlled (read-only) inputs.
  useEffect(() => {
    if (amount !== null) {
      setDisplayAmount(amount);
    }
  }, [amount, setDisplayAmount]);

  const isError = errorMessage !== null;

  return (
    <>
      <div
        className={twMerge(
          'flex flex-col gap-3 bg-mono-20 dark:bg-mono-180 p-3 rounded-lg border border-mono-40 dark:border-mono-160',
          isError && 'border-red-70 dark:border-red-50',
        )}
      >
        <div className="flex justify-between">
          <ProtocolTypeSelector
            selectedProtocolType={protocolId}
            setProtocolType={setChainId}
          />

          {rightElement}
        </div>

        <hr className="dark:border-mono-160" />

        <div className="flex gap-1">
          <input
            id={id}
            className={twMerge(
              'w-full bg-transparent border-none text-xl font-bold outline-none focus:ring-0',
              className,
            )}
            type="text"
            placeholder={placeholder}
            value={displayAmount}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={isReadOnly}
          />

          <TokenChip
            onClick={onTokenClick}
            token={token}
            isLiquidVariant={isTokenLiquidVariant}
          />
        </div>
      </div>

      {errorMessage !== null && (
        <Typography variant="body2" className="text-red-70 dark:text-red-50">
          * {errorMessage}
        </Typography>
      )}
    </>
  );
};

type ProtocolTypeSelectorProps = {
  selectedProtocolType: LsProtocolType;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setProtocolType?: (newProtocolType: LsProtocolType) => void;
};

/** @internal */
const ProtocolTypeSelector: FC<ProtocolTypeSelectorProps> = ({
  selectedProtocolType,
  setProtocolType,
}) => {
  const isReadOnly = selectedProtocolType === undefined;

  const selectedProtocolTypeMetadata =
    getLsProtocolTypeMetadata(selectedProtocolType);

  const base = (
    <div className="group flex gap-1 items-center justify-center">
      <div className="flex gap-2 items-center justify-center">
        <ChainIcon
          size="lg"
          name={selectedProtocolTypeMetadata.chainIconFileName}
        />

        <Typography variant="h5" fw="bold" className="dark:text-mono-40">
          {selectedProtocolTypeMetadata.networkName}
        </Typography>
      </div>

      {!isReadOnly && <DropdownChevronIcon isLarge />}
    </div>
  );

  return setProtocolType !== undefined ? (
    <Dropdown>
      <DropdownMenuTrigger>{base}</DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {LS_NETWORKS.map((protocolTypeMetadata) => {
              return (
                <li key={protocolTypeMetadata.type}>
                  <DropdownMenuItem
                    onClick={() => setProtocolType(protocolTypeMetadata.type)}
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <ChainIcon
                        size="lg"
                        name={protocolTypeMetadata.chainIconFileName}
                      />

                      <Typography
                        variant="h5"
                        fw="bold"
                        className="dark:text-mono-40"
                      >
                        {protocolTypeMetadata.networkName}
                      </Typography>
                    </div>
                  </DropdownMenuItem>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  ) : (
    base
  );
};

export default LiquidStakingInput;
