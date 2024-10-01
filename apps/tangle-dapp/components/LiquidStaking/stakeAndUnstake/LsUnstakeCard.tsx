'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import {
  LsNetworkId,
  LsProtocolId,
  LsSearchParamKey,
} from '../../../constants/liquidStaking/types';
import useRedeemTx from '../../../data/liquidStaking/parachain/useRedeemTx';
import useLsPoolUnbondTx from '../../../data/liquidStaking/tangle/useLsPoolUnbondTx';
import useLsExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useLsExchangeRate';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useLiquifierUnlock from '../../../data/liquifier/useLiquifierUnlock';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import FeeDetailItem from './FeeDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsFeeWarning from './LsFeeWarning';
import LsInput from './LsInput';
import SelectTokenModal from './SelectTokenModal';
import TotalDetailItem from './TotalDetailItem';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import useLsChangeNetwork from './useLsChangeNetwork';
import useLsSpendingLimits from './useLsSpendingLimits';

const LsUnstakeCard: FC = () => {
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);
  const activeAccountAddress = useActiveAccountAddress();
  const tryChangeNetwork = useLsChangeNetwork();

  const {
    selectedProtocolId,
    setSelectedProtocolId,
    selectedNetworkId,
    selectedPoolId,
  } = useLsStore();

  // TODO: Won't both of these hooks be attempting to update the same state?
  useSearchParamSync({
    key: LsSearchParamKey.PROTOCOL_ID,
    value: selectedProtocolId,
    parse: (value) => z.nativeEnum(LsProtocolId).parse(parseInt(value)),
    stringify: (value) => value.toString(),
    setValue: setSelectedProtocolId,
  });

  const { execute: executeParachainRedeemTx, status: parachainRedeemTxStatus } =
    useRedeemTx();

  const { execute: executeTangleUnbondTx, status: tangleUnbondTxStatus } =
    useLsPoolUnbondTx();

  const performLiquifierUnlock = useLiquifierUnlock();

  const { minSpendable, maxSpendable } = useLsSpendingLimits(
    false,
    selectedProtocolId,
  );

  const selectedProtocol = getLsProtocolDef(selectedProtocolId);

  const {
    exchangeRate: exchangeRateOrError,
    isRefreshing: isRefreshingExchangeRate,
  } = useLsExchangeRate(ExchangeRateType.DerivativeToNative);

  // TODO: Properly handle the error state.
  const exchangeRate =
    exchangeRateOrError instanceof Error ? null : exchangeRateOrError;

  useSearchParamSync({
    key: LsSearchParamKey.AMOUNT,
    value: fromAmount,
    setValue: setFromAmount,
    parse: (value) => new BN(value),
    stringify: (value) => value?.toString(),
  });

  const isTangleNetwork =
    selectedNetworkId === LsNetworkId.TANGLE_LOCAL ||
    selectedNetworkId === LsNetworkId.TANGLE_MAINNET ||
    selectedNetworkId === LsNetworkId.TANGLE_TESTNET;

  const handleUnstakeClick = useCallback(async () => {
    // Cannot perform transaction: Amount not set.
    if (fromAmount === null) {
      return;
    }

    if (
      selectedProtocol.networkId === LsNetworkId.TANGLE_RESTAKING_PARACHAIN &&
      executeParachainRedeemTx !== null
    ) {
      return executeParachainRedeemTx({
        amount: fromAmount,
        currency: selectedProtocol.currency,
      });
    } else if (
      selectedProtocol.networkId === LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER &&
      performLiquifierUnlock !== null
    ) {
      return performLiquifierUnlock(selectedProtocol.id, fromAmount);
    }

    if (
      isTangleNetwork &&
      executeTangleUnbondTx !== null &&
      selectedPoolId !== null
    ) {
      return executeTangleUnbondTx({
        points: fromAmount,
        poolId: selectedPoolId,
      });
    }
  }, [
    executeParachainRedeemTx,
    executeTangleUnbondTx,
    fromAmount,
    isTangleNetwork,
    performLiquifierUnlock,
    selectedPoolId,
    selectedProtocol,
  ]);

  const toAmount = useMemo(() => {
    if (fromAmount === null || exchangeRate === null) {
      return null;
    }

    return fromAmount.muln(exchangeRate);
  }, [exchangeRate, fromAmount]);

  const handleTokenSelect = useCallback(() => {
    setIsSelectTokenModalOpen(false);
  }, []);

  const selectTokenModalOptions = useMemo(() => {
    // TODO: Dummy data.
    return [{ address: '0x123456' as any, amount: new BN(100), decimals: 18 }];
  }, []);

  // Reset the input amount when the network changes.
  useEffect(() => {
    setFromAmount(null);
  }, [setFromAmount, selectedNetworkId]);

  const stakedWalletBalance = (
    <LsAgnosticBalance
      isNative={false}
      tooltip="Click to use all staked balance"
      onClick={() => setFromAmount(maxSpendable)}
    />
  );

  // TODO: Also check if the user has enough balance to unstake. Convert this into a self-executing function to break down the complexity of a one-liner.
  const canCallUnstake =
    (selectedProtocol.networkId === LsNetworkId.TANGLE_RESTAKING_PARACHAIN &&
      executeParachainRedeemTx !== null) ||
    (selectedProtocol.networkId === LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER &&
      performLiquifierUnlock !== null) ||
    (isTangleNetwork &&
      executeTangleUnbondTx !== null &&
      selectedPoolId !== null);

  return (
    <>
      {/* TODO: Have a way to trigger a refresh of the amount once the wallet balance (max) button is clicked. Need to signal to the liquid staking input to update its display amount based on the `fromAmount` prop. */}
      <LsInput
        id="liquid-staking-unstake-from"
        networkId={selectedNetworkId}
        setNetworkId={tryChangeNetwork}
        protocolId={selectedProtocolId}
        setProtocolId={setSelectedProtocolId}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${LS_DERIVATIVE_TOKEN_PREFIX}${selectedProtocol.token}`}
        rightElement={stakedWalletBalance}
        isDerivativeVariant
        minAmount={minSpendable ?? undefined}
        maxAmount={maxSpendable ?? undefined}
        maxErrorMessage="Not enough stake to redeem"
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LsInput
        id="liquid-staking-unstake-to"
        networkId={selectedNetworkId}
        protocolId={selectedProtocolId}
        amount={toAmount}
        decimals={selectedProtocol.decimals}
        placeholder={`0 ${selectedProtocol.token}`}
        token={selectedProtocol.token}
        isReadOnly
        className={isRefreshingExchangeRate ? 'animate-pulse' : undefined}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
        <UnstakePeriodDetailItem protocolId={selectedProtocolId} />

        <ExchangeRateDetailItem
          token={selectedProtocol.token}
          type={ExchangeRateType.DerivativeToNative}
        />

        <FeeDetailItem
          protocolId={selectedProtocolId}
          isMinting={false}
          inputAmount={fromAmount}
        />

        <TotalDetailItem
          isMinting={false}
          protocolId={selectedProtocolId}
          inputAmount={fromAmount}
        />
      </div>

      <LsFeeWarning isMinting={false} selectedProtocolId={selectedProtocolId} />

      <Button
        isDisabled={
          // No active account.
          activeAccountAddress === null ||
          !canCallUnstake ||
          // Amount not yet provided or is zero.
          fromAmount === null ||
          fromAmount.isZero()
        }
        isLoading={
          parachainRedeemTxStatus === TxStatus.PROCESSING ||
          tangleUnbondTxStatus === TxStatus.PROCESSING
        }
        loadingText="Processing"
        onClick={handleUnstakeClick}
        isFullWidth
      >
        Schedule Unstake
      </Button>

      <SelectTokenModal
        options={selectTokenModalOptions}
        isOpen={isSelectTokenModalOpen}
        onClose={() => setIsSelectTokenModalOpen(false)}
        onTokenSelect={handleTokenSelect}
      />
    </>
  );
};

export default LsUnstakeCard;
