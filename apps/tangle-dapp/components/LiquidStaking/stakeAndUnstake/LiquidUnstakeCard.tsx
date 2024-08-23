'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { LST_PREFIX } from '../../../constants/liquidStaking/constants';
import {
  LsProtocolId,
  LsSearchParamKey,
} from '../../../constants/liquidStaking/types';
import useExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useExchangeRate';
import { useLiquidStakingStore } from '../../../data/liquidStaking/useLiquidStakingStore';
import useRedeemTx from '../../../data/liquidStaking/useRedeemTx';
import useLiquifierUnlock from '../../../data/liquifier/useLiquifierUnlock';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import AgnosticLsBalance from './AgnosticLsBalance';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LiquidStakingInput from './LiquidStakingInput';
import MintAndRedeemFeeDetailItem from './MintAndRedeemFeeDetailItem';
import SelectTokenModal from './SelectTokenModal';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import UnstakeRequestSubmittedModal from './UnstakeRequestSubmittedModal';
import useLsSpendingLimits from './useLsSpendingLimits';

const LiquidUnstakeCard: FC = () => {
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);
  const { selectedProtocolId, setSelectedProtocolId } = useLiquidStakingStore();
  const activeAccountAddress = useActiveAccountAddress();

  const [didLiquifierUnlockSucceed, setDidLiquifierUnlockSucceed] =
    useState(false);

  const [isRequestSubmittedModalOpen, setIsRequestSubmittedModalOpen] =
    useState(false);

  // TODO: Won't both of these hooks be attempting to update the same state?
  useSearchParamSync({
    key: LsSearchParamKey.PROTOCOL_ID,
    value: selectedProtocolId,
    parse: (value) => z.nativeEnum(LsProtocolId).parse(parseInt(value)),
    stringify: (value) => value.toString(),
    setValue: setSelectedProtocolId,
  });

  const {
    execute: executeRedeemTx,
    status: redeemTxStatus,
    txHash: redeemTxHash,
  } = useRedeemTx();

  const performLiquifierUnlock = useLiquifierUnlock();

  const { minSpendable, maxSpendable } = useLsSpendingLimits(
    false,
    selectedProtocolId,
  );

  const selectedProtocol = getLsProtocolDef(selectedProtocolId);

  const { exchangeRate } = useExchangeRate(
    ExchangeRateType.LiquidToNative,
    selectedProtocol.id,
  );

  useSearchParamSync({
    key: LsSearchParamKey.AMOUNT,
    value: fromAmount,
    setValue: setFromAmount,
    parse: (value) => new BN(value),
    stringify: (value) => value?.toString(),
  });

  const handleUnstakeClick = useCallback(async () => {
    // Cannot perform transaction: Amount not set.
    if (fromAmount === null) {
      return;
    }

    if (selectedProtocol.type === 'parachain' && executeRedeemTx !== null) {
      executeRedeemTx({
        amount: fromAmount,
        currency: selectedProtocol.currency,
      });
    } else if (
      selectedProtocol.type === 'erc20' &&
      performLiquifierUnlock !== null
    ) {
      setDidLiquifierUnlockSucceed(false);

      const success = await performLiquifierUnlock(
        selectedProtocol.id,
        fromAmount,
      );

      setDidLiquifierUnlockSucceed(success);
    }
  }, [executeRedeemTx, fromAmount, performLiquifierUnlock, selectedProtocol]);

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

  // Open the request submitted modal when the redeem
  // transaction is complete.
  useEffect(() => {
    if (redeemTxStatus === TxStatus.COMPLETE || didLiquifierUnlockSucceed) {
      setIsRequestSubmittedModalOpen(true);
    }
  }, [didLiquifierUnlockSucceed, redeemTxStatus]);

  const stakedWalletBalance = (
    <AgnosticLsBalance
      isNative={false}
      protocolId={selectedProtocol.id}
      tooltip="Click to use all staked balance"
      onClick={() => setFromAmount(maxSpendable)}
    />
  );

  // TODO: Also check if the user has enough balance to unstake.
  const canCallUnstake =
    (selectedProtocol.type === 'parachain' && executeRedeemTx !== null) ||
    (selectedProtocol.type === 'erc20' && performLiquifierUnlock !== null);

  return (
    <>
      {/* TODO: Have a way to trigger a refresh of the amount once the wallet balance (max) button is clicked. Need to signal to the liquid staking input to update its display amount based on the `fromAmount` prop. */}
      <LiquidStakingInput
        id="liquid-staking-unstake-from"
        protocolId={LsProtocolId.TANGLE_RESTAKING_PARACHAIN}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${LST_PREFIX}${selectedProtocol.token}`}
        rightElement={stakedWalletBalance}
        isTokenLiquidVariant
        minAmount={minSpendable ?? undefined}
        maxAmount={maxSpendable ?? undefined}
        maxErrorMessage="Not enough stake to redeem"
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-unstake-to"
        protocolId={selectedProtocolId}
        amount={toAmount}
        decimals={selectedProtocol.decimals}
        placeholder={`0 ${selectedProtocol.token}`}
        token={selectedProtocol.token}
        setChainId={setSelectedProtocolId}
        isReadOnly
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
        <ExchangeRateDetailItem
          protocolId={selectedProtocol.id}
          token={selectedProtocol.token}
          type={ExchangeRateType.LiquidToNative}
        />

        <MintAndRedeemFeeDetailItem
          token={selectedProtocol.token}
          isMinting={false}
          intendedAmount={fromAmount}
        />

        <UnstakePeriodDetailItem protocolId={selectedProtocol.id} />
      </div>

      <Button
        isDisabled={
          // No active account.
          activeAccountAddress === null ||
          !canCallUnstake ||
          // Amount not yet provided or is zero.
          fromAmount === null ||
          fromAmount.isZero()
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
        txHash={redeemTxHash}
      />
    </>
  );
};

export default LiquidUnstakeCard;
