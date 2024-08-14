'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN, BN_ZERO } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Alert, Button } from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import {
  getLsProtocolDef,
  LsProtocolId,
  LsSearchParamKey,
  LST_PREFIX,
} from '../../../constants/liquidStaking/types';
import useDelegationsOccupiedStatus from '../../../data/liquidStaking/useDelegationsOccupiedStatus';
import useExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useExchangeRate';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import useRedeemTx from '../../../data/liquidStaking/useRedeemTx';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import useSearchParamState from '../../../hooks/useSearchParamState';
import useSearchParamSync from '../../../hooks/useSearchParamSync';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LiquidStakingInput from './LiquidStakingInput';
import MintAndRedeemFeeDetailItem from './MintAndRedeemFeeDetailItem';
import ParachainWalletBalance from './ParachainWalletBalance';
import SelectTokenModal from './SelectTokenModal';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';
import UnstakeRequestSubmittedModal from './UnstakeRequestSubmittedModal';

const LiquidUnstakeCard: FC = () => {
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  const [isRequestSubmittedModalOpen, setIsRequestSubmittedModalOpen] =
    useState(false);

  const [selectedChainId, setSelectedChainId] =
    useSearchParamState<LsProtocolId>({
      key: LsSearchParamKey.CHAIN_ID,
      defaultValue: LsProtocolId.TANGLE_RESTAKING_PARACHAIN,
      parser: (value) => z.nativeEnum(LsProtocolId).parse(parseInt(value)),
      stringify: (value) => value.toString(),
    });

  const {
    execute: executeRedeemTx,
    status: redeemTxStatus,
    txHash: redeemTxHash,
  } = useRedeemTx();

  const { liquidBalances } = useParachainBalances();

  const selectedProtocol = getLsProtocolDef(selectedChainId);

  const exchangeRate = useExchangeRate(
    ExchangeRateType.LiquidToNative,
    selectedProtocol.currency,
  );

  const { result: areAllDelegationsOccupiedOpt } = useDelegationsOccupiedStatus(
    selectedProtocol.currency,
  );

  useSearchParamSync({
    key: LsSearchParamKey.AMOUNT,
    value: fromAmount,
    setValue: setFromAmount,
    parse: (value) => new BN(value),
    stringify: (value) => value?.toString(),
  });

  const areAllDelegationsOccupied =
    areAllDelegationsOccupiedOpt === null
      ? null
      : areAllDelegationsOccupiedOpt.unwrapOrDefault();

  const { result: minimumRedeemAmount } = useApiRx(
    useCallback(
      (api) =>
        api.query.lstMinting.minimumRedeem({
          Native: selectedProtocol.currency,
        }),
      [selectedProtocol.currency],
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

    return liquidBalances.get(selectedProtocol.token) ?? BN_ZERO;
  }, [liquidBalances, selectedProtocol.token]);

  const handleUnstakeClick = useCallback(() => {
    if (executeRedeemTx === null || fromAmount === null) {
      return;
    }

    executeRedeemTx({
      amount: fromAmount,
      currency: selectedProtocol.currency,
    });
  }, [executeRedeemTx, fromAmount, selectedProtocol.currency]);

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
    if (redeemTxStatus === TxStatus.COMPLETE) {
      setIsRequestSubmittedModalOpen(true);
    }
  }, [redeemTxStatus]);

  const stakedWalletBalance = (
    <ParachainWalletBalance
      isNative={false}
      token={selectedProtocol.token}
      decimals={selectedProtocol.decimals}
      tooltip="Click to use all staked balance"
      onClick={() => setFromAmount(maximumInputAmount)}
    />
  );

  return (
    <>
      {/* TODO: Have a way to trigger a refresh of the amount once the wallet balance (max) button is clicked. Need to signal to the liquid staking input to update its display amount based on the `fromAmount` prop. */}
      <LiquidStakingInput
        id="liquid-staking-unstake-from"
        chainId={LsProtocolId.TANGLE_RESTAKING_PARACHAIN}
        token={selectedProtocol.token}
        amount={fromAmount}
        decimals={selectedProtocol.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${LST_PREFIX}${selectedProtocol.token}`}
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
        decimals={selectedProtocol.decimals}
        placeholder={`0 ${selectedProtocol.token}`}
        token={selectedProtocol.token}
        setChainId={setSelectedChainId}
        isReadOnly
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
        <ExchangeRateDetailItem
          token={selectedProtocol.token}
          type={ExchangeRateType.LiquidToNative}
          currency={selectedProtocol.currency}
        />

        <MintAndRedeemFeeDetailItem
          token={selectedProtocol.token}
          isMinting={false}
          intendedAmount={fromAmount}
        />

        <UnstakePeriodDetailItem currency={selectedProtocol.currency} />
      </div>

      {areAllDelegationsOccupied?.isTrue && (
        <Alert
          type="error"
          className="mt-4"
          title="All Delegations Occupied"
          description="Cannot redeem due to all delegations being occupied."
        />
      )}

      <Button
        isDisabled={
          // The redeem extrinsic is not ready to be executed. This
          // may indicate that there is no connected account.
          executeRedeemTx === null ||
          // Amount not yet provided or is zero.
          fromAmount === null ||
          fromAmount.isZero() ||
          // The extrinsic will fail once submitted due to unmet requirements.
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
        txHash={redeemTxHash}
      />
    </>
  );
};

export default LiquidUnstakeCard;
