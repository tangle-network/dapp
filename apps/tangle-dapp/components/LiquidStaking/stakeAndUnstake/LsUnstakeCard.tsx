'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';

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
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPercentage from '../../../utils/scaleAmountByPercentage';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import FeeDetailItem from './FeeDetailItem';
import LsAgnosticBalance from './LsAgnosticBalance';
import LsFeeWarning from './LsFeeWarning';
import LsInput from './LsInput';
import SelectTokenModal from './SelectTokenModal';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import useLsChangeNetwork from './useLsChangeNetwork';
import useLsFeePercentage from './useLsFeePercentage';
import useLsSpendingLimits from './useLsSpendingLimits';
import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';

const LsUnstakeCard: FC = () => {
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);
  const activeAccountAddress = useActiveAccountAddress();
  const tryChangeNetwork = useLsChangeNetwork();
  const fromLsInputRef = useRef<HTMLInputElement>(null);

  const { lsProtocolId, setLsProtocolId, lsNetworkId, lsPoolId } = useLsStore();

  // TODO: Won't both of these hooks be attempting to update the same state?
  useSearchParamSync({
    key: LsSearchParamKey.PROTOCOL_ID,
    value: lsProtocolId,
    parse: (value) => z.nativeEnum(LsProtocolId).parse(parseInt(value)),
    stringify: (value) => value.toString(),
    setValue: setLsProtocolId,
  });

  const { execute: executeParachainRedeemTx, status: parachainRedeemTxStatus } =
    useRedeemTx();

  const { execute: executeTangleUnbondTx, status: tangleUnbondTxStatus } =
    useLsPoolUnbondTx();

  const { minSpendable, maxSpendable } = useLsSpendingLimits(
    false,
    lsProtocolId,
  );

  const selectedProtocol = getLsProtocolDef(lsProtocolId);

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
    lsNetworkId === LsNetworkId.TANGLE_LOCAL ||
    lsNetworkId === LsNetworkId.TANGLE_MAINNET ||
    lsNetworkId === LsNetworkId.TANGLE_TESTNET;

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
      isTangleNetwork &&
      executeTangleUnbondTx !== null &&
      lsPoolId !== null
    ) {
      return executeTangleUnbondTx({
        points: fromAmount,
        poolId: lsPoolId,
      });
    }
  }, [
    executeParachainRedeemTx,
    executeTangleUnbondTx,
    fromAmount,
    isTangleNetwork,
    lsPoolId,
    selectedProtocol,
  ]);

  const feePercentage = useLsFeePercentage(lsProtocolId, false);

  const toAmount = useMemo(() => {
    if (
      fromAmount === null ||
      exchangeRate === null ||
      typeof feePercentage !== 'number'
    ) {
      return null;
    }

    const feeAmount = scaleAmountByPercentage(fromAmount, feePercentage);

    return fromAmount.divn(exchangeRate).sub(feeAmount);
  }, [exchangeRate, feePercentage, fromAmount]);

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
  }, [setFromAmount, lsNetworkId]);

  // On mount, set the focus on the from input.
  useEffect(() => {
    if (fromLsInputRef.current !== null) {
      fromLsInputRef.current.focus();
    }
  }, []);

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
    (isTangleNetwork && executeTangleUnbondTx !== null && lsPoolId !== null);

  return (
    <>
      {/* TODO: Have a way to trigger a refresh of the amount once the wallet balance (max) button is clicked. Need to signal to the liquid staking input to update its display amount based on the `fromAmount` prop. */}
      <LsInput
        ref={fromLsInputRef}
        id="liquid-staking-unstake-from"
        networkId={lsNetworkId}
        setNetworkId={tryChangeNetwork}
        setProtocolId={setLsProtocolId}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder="Enter amount to unstake"
        rightElement={stakedWalletBalance}
        isDerivativeVariant
        minAmount={minSpendable ?? undefined}
        maxAmount={maxSpendable ?? undefined}
        maxErrorMessage="Not enough stake to redeem"
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
        showPoolIndicator={false}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LsInput
        id="liquid-staking-unstake-to"
        networkId={lsNetworkId}
        amount={toAmount}
        decimals={selectedProtocol.decimals}
        placeholder={EMPTY_VALUE_PLACEHOLDER}
        token={selectedProtocol.token}
        isReadOnly
        className={isRefreshingExchangeRate ? 'animate-pulse' : undefined}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
        <UnstakePeriodDetailItem protocolId={lsProtocolId} />

        <ExchangeRateDetailItem
          token={selectedProtocol.token}
          type={ExchangeRateType.DerivativeToNative}
        />

        <FeeDetailItem
          protocolId={lsProtocolId}
          isStaking={false}
          inputAmount={fromAmount}
        />
      </div>

      <LsFeeWarning isMinting={false} selectedProtocolId={lsProtocolId} />

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
