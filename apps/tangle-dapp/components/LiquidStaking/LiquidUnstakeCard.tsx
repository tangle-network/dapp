'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN, BN_ZERO } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { InformationLine } from '@webb-tools/icons';
import {
  Button,
  IconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';

import {
  LIQUID_STAKING_CHAIN_MAP,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChainId,
} from '../../constants/liquidStaking';
import useParachainBalances from '../../data/liquidStaking/useParachainBalances';
import useRedeemTx from '../../data/liquidStaking/useRedeemTx';
import useApi from '../../hooks/useApi';
import useApiRx from '../../hooks/useApiRx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import LiquidStakingInput from './LiquidStakingInput';
import ParachainWalletBalance from './ParachainWalletBalance';
import SelectTokenModal from './SelectTokenModal';
import UnstakeRequestSubmittedModal from './UnstakeRequestSubmittedModal';

const LiquidUnstakeCard: FC = () => {
  const [isSelectTokenModalOpen, setIsSelectTokenModalOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  const [isRequestSubmittedModalOpen, setIsRequestSubmittedModalOpen] =
    useState(false);

  // TODO: The rate will likely be a hook on its own, likely needs to be extracted from the Tangle Restaking Parachain via a query/subscription.
  const [rate] = useState<number | null>(1.0);

  const [selectedChainId, setSelectedChainId] = useState<LiquidStakingChainId>(
    LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN,
  );

  const { execute: executeRedeemTx, status: redeemTxStatus } = useRedeemTx();
  const { nativeBalances } = useParachainBalances();

  const selectedChain = LIQUID_STAKING_CHAIN_MAP[selectedChainId];

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
    if (nativeBalances === null) {
      return null;
    }

    return nativeBalances.get(selectedChain.token) ?? BN_ZERO;
  }, [nativeBalances, selectedChain.token]);

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
    if (fromAmount === null || rate === null) {
      return null;
    }

    return fromAmount.muln(rate);
  }, [fromAmount, rate]);

  const handleTokenSelect = useCallback(() => {
    setIsSelectTokenModalOpen(false);
  }, []);

  const selectTokenModalOptions = useMemo(() => {
    // TODO: Dummy data.
    return [{ address: '0x123456' as any, amount: new BN(100), decimals: 18 }];
  }, []);

  const stakedBalance = (
    <ParachainWalletBalance
      isNative={false}
      token={selectedChain.token}
      tooltip="Click to use all staked balance"
      onClick={() => setFromAmount(maximumInputAmount)}
    />
  );

  return (
    <>
      <LiquidStakingInput
        id="liquid-staking-unstake-from"
        chain={LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN}
        token={selectedChain.token}
        amount={fromAmount}
        setAmount={setFromAmount}
        placeholder={`0 ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChain.token}`}
        rightElement={stakedBalance}
        isTokenLiquidVariant
        minAmount={minimumInputAmount ?? undefined}
        maxAmount={maximumInputAmount ?? undefined}
        maxErrorMessage="Not enough stake to redeem"
        onTokenClick={() => setIsSelectTokenModalOpen(true)}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-unstake-to"
        chain={selectedChainId}
        amount={toAmount}
        placeholder={`0 ${selectedChain.token}`}
        token={selectedChain.token}
        setChain={setSelectedChainId}
        isReadOnly
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 bg-mono-20 dark:bg-mono-180 rounded-lg">
        <DetailItem
          title="Rate"
          tooltip="This is a test."
          value={
            <>
              <strong>1</strong> {selectedChain.token}{' '}
              <strong> = {rate}</strong> {LIQUID_STAKING_TOKEN_PREFIX}
              {selectedChain.token}
            </>
          }
        />

        <DetailItem
          title="Cross-chain fee"
          tooltip="This is a test."
          value={
            <>
              <strong>0.001984</strong> {selectedChain.token}
            </>
          }
        />

        <DetailItem
          title="Unstake period"
          tooltip="The period of time you need to wait before you can unstake your tokens."
          value={
            <>
              <strong>7</strong> days
            </>
          }
        />
      </div>

      <Button
        isDisabled={
          executeRedeemTx === null || fromAmount === null || fromAmount.isZero()
        }
        isLoading={redeemTxStatus === TxStatus.PROCESSING}
        loadingText="Processing"
        onClick={handleUnstakeClick}
        isFullWidth
      >
        Unstake
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

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: string | ReactNode;
};

/** @internal */
const DetailItem: FC<DetailItemProps> = ({ title, tooltip, value }) => {
  return (
    <div className="flex gap-2 justify-between w-full">
      <div className="flex items-center gap-1">
        <Typography variant="body1" fw="normal">
          {title}
        </Typography>

        {tooltip !== undefined && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-140 dark:fill-mono-100" />
            }
            content={tooltip}
            overrideTooltipBodyProps={{
              className: 'max-w-[350px]',
            }}
          />
        )}
      </div>

      <Typography className="dark:text-mono-0" variant="body1" fw="normal">
        {value}
      </Typography>
    </div>
  );
};

export default LiquidUnstakeCard;
