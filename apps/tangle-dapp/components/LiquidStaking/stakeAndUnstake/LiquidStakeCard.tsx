'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Search } from '@webb-tools/icons';
import {
  Button,
  Chip,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import React, { FC, useCallback, useMemo } from 'react';
import { z } from 'zod';

import {
  getLsProtocolDef,
  LsProtocolId,
  LsSearchParamKey,
  LST_PREFIX,
} from '../../../constants/liquidStaking/types';
import useExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useExchangeRate';
import { useLiquidStakingStore } from '../../../data/liquidStaking/useLiquidStakingStore';
import useMintTx from '../../../data/liquidStaking/useMintTx';
import useSearchParamState from '../../../hooks/useSearchParamState';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import AgnosticLsBalance from './AgnosticLsBalance';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LiquidStakingInput from './LiquidStakingInput';
import MintAndRedeemFeeDetailItem from './MintAndRedeemFeeDetailItem';
import SelectValidatorsButton from './SelectValidatorsButton';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import useLsSpendingLimits from './useLsSpendingLimits';

const LiquidStakeCard: FC = () => {
  const [fromAmount, setFromAmount] = useSearchParamState<BN | null>({
    defaultValue: null,
    key: LsSearchParamKey.AMOUNT,
    parser: (value) => new BN(value),
    stringify: (value) => value?.toString(),
  });

  const { selectedChainId, setSelectedChainId } = useLiquidStakingStore();
  const { execute: executeMintTx, status: mintTxStatus } = useMintTx();

  const { maxSpendable, minSpendable } = useLsSpendingLimits(
    true,
    selectedChainId,
  );

  const selectedProtocol = getLsProtocolDef(selectedChainId);

  useSearchParamSync({
    key: LsSearchParamKey.PROTOCOL_ID,
    value: selectedChainId,
    parse: (value) => z.nativeEnum(LsProtocolId).parse(parseInt(value)),
    stringify: (value) => value.toString(),
    setValue: setSelectedChainId,
  });

  const { exchangeRate } = useExchangeRate(
    ExchangeRateType.NativeToLiquid,
    selectedProtocol.currency,
  );

  const handleStakeClick = useCallback(() => {
    if (executeMintTx === null || fromAmount === null) {
      return;
    }

    executeMintTx({
      amount: fromAmount,
      currency: selectedProtocol.currency,
    });
  }, [executeMintTx, fromAmount, selectedProtocol.currency]);

  const toAmount = useMemo(() => {
    if (fromAmount === null || exchangeRate === null) {
      return null;
    }

    return fromAmount.muln(exchangeRate);
  }, [fromAmount, exchangeRate]);

  const walletBalance = (
    <AgnosticLsBalance
      protocolId={selectedProtocol.id}
      decimals={selectedProtocol.decimals}
      tooltip="Click to use all available balance"
      onClick={() => setFromAmount(maxSpendable)}
    />
  );

  return (
    <>
      <LiquidStakingInput
        id="liquid-staking-stake-from"
        protocolId={selectedChainId}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${selectedProtocol.token}`}
        rightElement={walletBalance}
        setChainId={setSelectedChainId}
        minAmount={minSpendable ?? undefined}
        maxAmount={maxSpendable ?? undefined}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-stake-to"
        protocolId={LsProtocolId.TANGLE_RESTAKING_PARACHAIN}
        placeholder={`0 ${LST_PREFIX}${selectedProtocol.token}`}
        decimals={selectedProtocol.decimals}
        amount={toAmount}
        isReadOnly
        isTokenLiquidVariant
        token={selectedProtocol.token}
        rightElement={<SelectValidatorsButton />}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
        <ExchangeRateDetailItem
          protocolId={selectedProtocol.id}
          token={selectedProtocol.token}
          type={ExchangeRateType.NativeToLiquid}
        />

        <MintAndRedeemFeeDetailItem
          intendedAmount={fromAmount}
          isMinting
          token={selectedProtocol.token}
        />

        <UnstakePeriodDetailItem currency={selectedProtocol.currency} />
      </div>

      <Button
        isDisabled={
          // Mint transaction is not available yet. This may indicate
          // that there is no connected account.
          executeMintTx === null ||
          // No amount entered or amount is zero.
          fromAmount === null ||
          fromAmount.isZero()
        }
        isLoading={mintTxStatus === TxStatus.PROCESSING}
        loadingText="Processing"
        onClick={handleStakeClick}
        isFullWidth
      >
        Stake
      </Button>
    </>
  );
};

type ParachainItem = {
  id: number;
  name: string;
  icon: string;
  isConnected: boolean;
};

type SelectParachainContentProps = {
  parachains: ParachainItem[];
};

// TODO: Not yet used. Exported on purpose to avoid getting warnings. However, this is a local component.
/** @internal */
export const SelectParachainContent: FC<SelectParachainContentProps> = ({
  parachains,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Typography variant="h5" fw="bold">
        Select Parachain
      </Typography>

      <Input
        id="select-parachain-content-search"
        placeholder="Search parachains..."
        rightIcon={<Search />}
      />

      <div className="flex flex-col gap-2 p-2">
        {parachains.map((parachain) => (
          <div
            key={parachain.id}
            className="flex items-center justify-between gap-1 px-4 py-3"
          >
            <div className="flex gap-2 items-center">
              <Typography variant="h5" fw="bold" className="dark:text-mono-0">
                {parachain.name}
              </Typography>
            </div>

            {parachain.isConnected && <Chip color="green">Connected</Chip>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiquidStakeCard;
