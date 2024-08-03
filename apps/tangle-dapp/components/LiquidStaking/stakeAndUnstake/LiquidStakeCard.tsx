'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN, BN_ZERO } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Search } from '@webb-tools/icons';
import {
  Button,
  Chip,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  LST_PREFIX,
  PARACHAIN_CHAIN_MAP,
  ParachainChainId,
} from '../../../constants/liquidStaking';
import { useLiquidStakingStore } from '../../../data/liquidStaking/store';
import useExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useExchangeRate';
import useMintTx from '../../../data/liquidStaking/useMintTx';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import DetailItem from './DetailItem';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LiquidStakingInput from './LiquidStakingInput';
import MintAndRedeemFeeDetailItem from './MintAndRedeemFeeDetailItem';
import ParachainWalletBalance from './ParachainWalletBalance';
import SelectValidatorsButton from './SelectValidatorsButton';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';

const LiquidStakeCard: FC = () => {
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  const { selectedChainId, setSelectedChainId } = useLiquidStakingStore();

  const { execute: executeMintTx, status: mintTxStatus } = useMintTx();
  const { nativeBalances } = useParachainBalances();

  const selectedChain = PARACHAIN_CHAIN_MAP[selectedChainId];

  const exchangeRate = useExchangeRate(
    ExchangeRateType.NativeToLiquid,
    selectedChain.currency,
  );

  const { result: minimumMintingAmount } = useApiRx(
    useCallback(
      (api) =>
        api.query.lstMinting.minimumMint({
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
    if (minimumMintingAmount === null || existentialDepositAmount === null) {
      return null;
    }

    return BN.max(minimumMintingAmount, existentialDepositAmount);
  }, [existentialDepositAmount, minimumMintingAmount]);

  const maximumInputAmount = useMemo(() => {
    if (nativeBalances === null) {
      return null;
    }

    return nativeBalances.get(selectedChain.token) ?? BN_ZERO;
  }, [nativeBalances, selectedChain.token]);

  const handleStakeClick = useCallback(() => {
    if (executeMintTx === null || fromAmount === null) {
      return;
    }

    executeMintTx({
      amount: fromAmount,
      currency: selectedChain.currency,
    });
  }, [executeMintTx, fromAmount, selectedChain.currency]);

  const toAmount = useMemo(() => {
    if (fromAmount === null || exchangeRate === null) {
      return null;
    }

    return fromAmount.muln(exchangeRate);
  }, [fromAmount, exchangeRate]);

  const walletBalance = (
    <ParachainWalletBalance
      token={selectedChain.token}
      decimals={selectedChain.decimals}
      tooltip="Click to use all available balance"
      onClick={() => setFromAmount(maximumInputAmount)}
    />
  );

  return (
    <>
      <LiquidStakingInput
        id="liquid-staking-stake-from"
        chainId={selectedChainId}
        token={selectedChain.token}
        amount={fromAmount}
        decimals={selectedChain.decimals}
        onAmountChange={setFromAmount}
        placeholder={`0 ${selectedChain.token}`}
        rightElement={walletBalance}
        setChainId={setSelectedChainId}
        minAmount={minimumInputAmount ?? undefined}
        maxAmount={maximumInputAmount ?? undefined}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-stake-to"
        chainId={ParachainChainId.TANGLE_RESTAKING_PARACHAIN}
        placeholder={`0 ${LST_PREFIX}${selectedChain.token}`}
        decimals={selectedChain.decimals}
        amount={toAmount}
        isReadOnly
        isTokenLiquidVariant
        token={selectedChain.token}
        rightElement={<SelectValidatorsButton />}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3">
        <ExchangeRateDetailItem
          token={selectedChain.token}
          currency={selectedChain.currency}
          type={ExchangeRateType.NativeToLiquid}
        />

        <MintAndRedeemFeeDetailItem
          intendedAmount={fromAmount}
          isMinting
          token={selectedChain.token}
        />

        <UnstakePeriodDetailItem currency={selectedChain.currency} />

        <DetailItem title="Estimated wait time" value="~10 minutes" />
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
