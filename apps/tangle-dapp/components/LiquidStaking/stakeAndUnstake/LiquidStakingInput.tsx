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
  LS_DERIVATIVE_TOKEN_PREFIX,
  LS_NETWORKS,
} from '../../../constants/liquidStaking/constants';
import {
  LsNetworkId,
  LsProtocolId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../../containers/ManageProfileModalContainer/Independent/IndependentAllocationInput';
import useInputAmount from '../../../hooks/useInputAmount';
import formatBn from '../../../utils/formatBn';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import DropdownChevronIcon from './DropdownChevronIcon';

export type LiquidStakingInputProps = {
  id: string;
  networkId: LsNetworkId;
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
  setProtocolId?: (newProtocolId: LsProtocolId) => void;
  setNetworkId?: (newNetworkId: LsNetworkId) => void;
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
  networkId,
  token,
  minAmount,
  maxAmount,
  maxErrorMessage = ERROR_NOT_ENOUGH_BALANCE,
  onAmountChange,
  setProtocolId,
  setNetworkId,
  onTokenClick,
  className,
}) => {
  const minErrorMessage = ((): string | undefined => {
    if (minAmount === undefined) {
      return undefined;
    }

    const unit = `${isTokenLiquidVariant ? LS_DERIVATIVE_TOKEN_PREFIX : ''}${token}`;

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
          <NetworkSelector
            selectedNetworkId={networkId}
            setNetworkId={setNetworkId}
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

          {/** TODO: Replace token chip with protocol chip styling. */}
          {/* <TokenChip
            onClick={onTokenClick}
            token={token}
            isLiquidVariant={isTokenLiquidVariant}
          /> */}
          <ProtocolSelector
            selectedNetworkId={networkId}
            selectedProtocolId={protocolId}
            setProtocolId={setProtocolId}
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

type NetworkSelectorProps = {
  selectedNetworkId: LsNetworkId;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setNetworkId?: (newNetworkId: LsNetworkId) => void;
};

/** @internal */
const NetworkSelector: FC<NetworkSelectorProps> = ({
  selectedNetworkId,
  setNetworkId,
}) => {
  const isReadOnly = selectedNetworkId === undefined;
  const selectedProtocolTypeMetadata = getLsNetwork(selectedNetworkId);

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

  return setNetworkId !== undefined ? (
    <Dropdown>
      <DropdownMenuTrigger>{base}</DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {LS_NETWORKS.map((protocolTypeMetadata) => {
              return (
                <li key={protocolTypeMetadata.type}>
                  <DropdownMenuItem
                    onClick={() => setNetworkId(protocolTypeMetadata.type)}
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

type ProtocolSelectorProps = {
  selectedNetworkId: LsNetworkId;
  selectedProtocolId: LsProtocolId;
  setProtocolId?: (newProtocolId: LsProtocolId) => void;
};

/** @internal */
const ProtocolSelector: FC<ProtocolSelectorProps> = ({
  selectedNetworkId,
  selectedProtocolId,
  setProtocolId,
}) => {
  const protocol = getLsProtocolDef(selectedProtocolId);
  const network = getLsNetwork(selectedNetworkId);

  const trySetProtocolId = (newProtocolId: LsProtocolId) => {
    return () => {
      if (setProtocolId === undefined) {
        return;
      }

      setProtocolId(newProtocolId);
    };
  };

  return (
    <Dropdown>
      <DropdownMenuTrigger>
        <div className="group flex gap-1 items-center justify-center">
          <Typography variant="h5" fw="bold" className="dark:text-mono-40">
            {protocol.name}
          </Typography>

          <DropdownChevronIcon isLarge />
        </div>
      </DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {network.protocols.map((protocol) => {
              return (
                <li key={protocol.id}>
                  <DropdownMenuItem onClick={trySetProtocolId(protocol.id)}>
                    <Typography
                      variant="h5"
                      fw="bold"
                      className="dark:text-mono-40"
                    >
                      {protocol.name}
                    </Typography>
                  </DropdownMenuItem>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  );
};

export default LiquidStakingInput;
