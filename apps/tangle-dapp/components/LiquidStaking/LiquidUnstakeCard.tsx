'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN, BN_ZERO } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Alert, Button } from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  LIQUID_STAKING_CHAIN_MAP,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChainId,
} from '../../constants/liquidStaking';
import useDelegationsOccupiedStatus from '../../data/liquidStaking/useDelegationsOccupiedStatus';
import useExchangeRate, {
  ExchangeRateType,
} from '../../data/liquidStaking/useExchangeRate';
import useParachainBalances from '../../data/liquidStaking/useParachainBalances';
import useRedeemTx from '../../data/liquidStaking/useRedeemTx';
import useApi from '../../hooks/useApi';
import useApiRx from '../../hooks/useApiRx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LiquidStakingInput from './LiquidStakingInput';
import MintAndRedeemFeeDetailItem from './MintAndRedeemFeeDetailItem';
import OngoingTimeUnitUnstakeCheck from './OngoingTimeUnitUnstakeCheck';
import ParachainWalletBalance from './ParachainWalletBalance';
import SelectTokenModal from './SelectTokenModal';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import UnstakeRequestSubmittedModal from './UnstakeRequestSubmittedModal';

const LiquidUnstakeCard: FC = () => {
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  const [isRequestSubmittedModalOpen, setIsRequestSubmittedModalOpen] =
    useState(false);

  const [selectedChainId, setSelectedChainId] = useState<LiquidStakingChainId>(
    LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN,
  );

  const { execute: executeRedeemTx, status: redeemTxStatus } = useRedeemTx();
  const { liquidBalances } = useParachainBalances();

  const selectedChain = LIQUID_STAKING_CHAIN_MAP[selectedChainId];

  const exchangeRateOpt = useExchangeRate(
    ExchangeRateType.LiquidToNative,
    selectedChain.currency,
  );

  const { result: areAllDelegationsOccupiedOpt } = useDelegationsOccupiedStatus(
    selectedChain.currency,
  );

  const areAllDelegationsOccupied =
    areAllDelegationsOccupiedOpt === null
      ? null
      : areAllDelegationsOccupiedOpt.unwrapOrDefault();

  const { result: minimumRedeemAmount } = useApiRx(
    useCallback(
      (api) =>
        api.query.lstMinting.minimumRedeem({
          Native: selectedChain.currency,
        }),
      [selectedChain.currency],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: existentialDepositAmount } = useApi(
    useCallback((api) => api.consts.balances.existentialDeposit, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const minimumInputAmount = useMemo(() => {
    if (minimumRedeemAmount === null || existentialDepositAmount === null) {
      return null;
    }

    return BN.max(minimumRedeemAmount, existentialDepositAmount);
  }, [existentialDepositAmount, minimumRedeemAmount]);

  const maximumInputAmount = useMemo(() => {
    if (liquidBalances === null) {
      return null;
    }

    return liquidBalances.get(selectedChain.token) ?? BN_ZERO;
  }, [liquidBalances, selectedChain.token]);

  const handleUnstakeClick = useCallback(() => {
    if (executeRedeemTx === null || fromAmount === null) {
      return;
    }

    executeRedeemTx({
      amount: fromAmount,
      currency: selectedChain.currency,
    });
  }, [executeRedeemTx, fromAmount, selectedChain.currency]);

  const toAmount = useMemo(() => {
    if (
      fromAmount === null ||
      exchangeRateOpt === null ||
      exchangeRateOpt.value === null
    ) {
      return null;
    }

    return fromAmount.muln(exchangeRateOpt.value);
  }, [exchangeRateOpt, fromAmount]);

  const handleTokenSelect = useCallback(() => {
    setIsSelectTokenModalOpen(false);
  }, []);

  const selectTokenModalOptions = useMemo(() => {
    // TODO: Dummy data.
    return [{ address: '0x123456' as any, amount: new BN(100), decimals: 18 }];
  }, []);

  const stakedWalletBalance = (
    <ParachainWalletBalance
      isNative={false}
      token={selectedChain.token}
      decimals={selectedChain.decimals}
      tooltip="Click to use all staked balance"
      onClick={() => setFromAmount(maximumInputAmount)}
    />
  );

  return (
    <>
      {/* TODO: Have a way to trigger a refresh of the amount once the wallet balance (max) button is clicked. Need to signal to the liquid staking input to update its display amount based on the `fromAmount` prop. */}
      <LiquidStakingInput
        id="liquid-staking-unstake-from"
        chainId={LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN}
        token={selectedChain.token}
        amount={fromAmount}
        decimals={selectedChain.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChain.token}`}
        rightElement={stakedWalletBalance}
        isTokenLiquidVariant
        minAmount={minimumInputAmount ?? undefined}
        maxAmount={maximumInputAmount ?? undefined}
        maxErrorMessage="Not enough stake to redeem"
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-unstake-to"
        chainId={selectedChainId}
        amount={toAmount}
        decimals={selectedChain.decimals}
        placeholder={`0 ${selectedChain.token}`}
        token={selectedChain.token}
        setChainId={setSelectedChainId}
        isReadOnly
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 bg-mono-20 dark:bg-mono-180 rounded-lg">
        <ExchangeRateDetailItem
          token={selectedChain.token}
          type={ExchangeRateType.LiquidToNative}
          currency={selectedChain.currency}
        />

        <MintAndRedeemFeeDetailItem
          token={selectedChain.token}
          isMinting={false}
          intendedAmount={fromAmount}
        />

        <UnstakePeriodDetailItem />
      </div>

      {areAllDelegationsOccupied?.isTrue && (
        <Alert
          type="warning"
          className="mt-4"
          description="Cannot redeem due to all delegations being occupied."
        />
      )}

      <OngoingTimeUnitUnstakeCheck currency={selectedChain.currency} />

      {/* TODO: Disable unstake button if no account is connected. Perhaps consider adding a tooltip instructing the user to connect an account in order to use this action. */}
      <Button
        isDisabled={
          executeRedeemTx === null ||
          fromAmount === null ||
          fromAmount.isZero() ||
          areAllDelegationsOccupied === null
        }
        isLoading={redeemTxStatus === TxStatus.PROCESSING}
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

      <UnstakeRequestSubmittedModal
        isOpen={isRequestSubmittedModalOpen}
        onClose={() => setIsRequestSubmittedModalOpen(false)}
        unstakeRequest={null as any}
      />
    </>
  );
};

export default LiquidUnstakeCard;
