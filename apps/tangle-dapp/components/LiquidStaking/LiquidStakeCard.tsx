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
  LIQUID_STAKING_CHAIN_MAP,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChainId,
} from '../../constants/liquidStaking';
import useExchangeRate, {
  ExchangeRateType,
} from '../../data/liquidStaking/useExchangeRate';
import useMintTx from '../../data/liquidStaking/useMintTx';
import useParachainBalances from '../../data/liquidStaking/useParachainBalances';
import useApi from '../../hooks/useApi';
import useApiRx from '../../hooks/useApiRx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import DetailItem from './DetailItem';
import ExchangeRateDetailItem from './ExchangeRateDetailItem';
import LiquidStakingInput from './LiquidStakingInput';
import MintAndRedeemFeeDetailItem from './MintAndRedeemFeeDetailItem';
import ParachainWalletBalance from './ParachainWalletBalance';
import SelectValidators from './SelectValidators';
import UnstakePeriodDetailItem from './UnstakePeriodDetailItem';

const LiquidStakeCard: FC = () => {
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  const [selectedChainId, setSelectedChainId] = useState<LiquidStakingChainId>(
    LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN,
  );

  const { execute: executeMintTx, status: mintTxStatus } = useMintTx();
  const { nativeBalances } = useParachainBalances();

  const selectedChain = LIQUID_STAKING_CHAIN_MAP[selectedChainId];

  const exchangeRateOpt = useExchangeRate(
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
    if (
      fromAmount === null ||
      exchangeRateOpt === null ||
      exchangeRateOpt.value === null
    ) {
      return null;
    }

    return fromAmount.muln(exchangeRateOpt.value);
  }, [fromAmount, exchangeRateOpt]);

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
        chainId={LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN}
        placeholder={`0 ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChain.token}`}
        decimals={selectedChain.decimals}
        amount={toAmount}
        isReadOnly
        isTokenLiquidVariant
        token={selectedChain.token}
        rightElement={<SelectValidators />}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 bg-mono-20 dark:bg-mono-180 rounded-lg">
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

        <UnstakePeriodDetailItem />

        <DetailItem title="Estimated wait time" value="~10 minutes" />
      </div>

      <Button
        isDisabled={
          // Mint transaction is not available yet. This may indicate
          // that there is no connected account.
          executeMintTx === null ||
          // No amount entered or amount is zero.
          fromAmount === null ||
          fromAmount.isZero() ||
          // TODO: This should actually only apply to unstaking, since when staking the user itself is the liquidity provider, since they are minting LSTs.
          // No liquidity available for this token.
          exchangeRateOpt?.isEmpty === true
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
