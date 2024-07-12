'use client';

// This will override global types and provide type definitions for
// the `lstMinting` pallet for this file only.
import '@webb-tools/tangle-restaking-types';

import { BN, BN_ZERO } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { InformationLine, Search } from '@webb-tools/icons';
import {
  Button,
  Chip,
  IconWithTooltip,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  LIQUID_STAKING_CHAIN_MAP,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChainId,
  LiquidStakingToken,
} from '../../constants/liquidStaking';
import useMintTx from '../../data/liquidStaking/useMintTx';
import useParachainBalances from '../../data/liquidStaking/useParachainBalances';
import useApi from '../../hooks/useApi';
import useApiRx from '../../hooks/useApiRx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import LiquidStakingInput from './LiquidStakingInput';
import ParachainWalletBalance from './ParachainWalletBalance';
import SelectValidators from './SelectValidators';

const LiquidStakeCard: FC = () => {
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  // TODO: The rate will likely be a hook on its own, likely needs to be extracted from the Tangle Restaking Parachain via a query/subscription.
  const [rate] = useState<number | null>(1.0);

  const [selectedChainId, setSelectedChainId] = useState<LiquidStakingChainId>(
    LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN,
  );

  const { execute: executeMintTx, status: mintTxStatus } = useMintTx();
  const { nativeBalances } = useParachainBalances();

  const selectedChain = LIQUID_STAKING_CHAIN_MAP[selectedChainId];

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
    if (fromAmount === null || rate === null) {
      return null;
    }

    return fromAmount.muln(rate);
  }, [fromAmount, rate]);

  // TODO: Temporary. Use actual token.
  const walletBalance = (
    <ParachainWalletBalance
      token={LiquidStakingToken.TNT}
      tooltip="Click to use all available balance"
    />
  );

  return (
    <>
      <LiquidStakingInput
        id="liquid-staking-stake-from"
        chain={selectedChainId}
        token={selectedChain.token}
        amount={fromAmount}
        setAmount={setFromAmount}
        placeholder={`0 ${selectedChain.token}`}
        rightElement={walletBalance}
        setChain={setSelectedChainId}
        minAmount={minimumInputAmount ?? undefined}
        maxAmount={maximumInputAmount ?? undefined}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-stake-to"
        chain={LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN}
        placeholder={`0 ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChain.token}`}
        amount={toAmount}
        isReadOnly
        isTokenLiquidVariant
        token={selectedChain.token}
        rightElement={<SelectValidators />}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 bg-mono-20 dark:bg-mono-180 rounded-lg">
        <DetailItem
          title="Rate"
          tooltip="This is a test."
          value={`1 ${selectedChain.token} = ${rate} ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChain.token}`}
        />

        <DetailItem
          title="Cross-chain fee"
          tooltip="This is a test."
          value={`0.001984 ${selectedChain.token}`}
        />

        <DetailItem
          title="Unstake period"
          tooltip="The period of time you need to wait before you can unstake your tokens."
          value="7 days"
        />

        <DetailItem title="Estimated wait time" value="~10 minutes" />
      </div>

      <Button
        isDisabled={
          executeMintTx === null || fromAmount === null || fromAmount.isZero()
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

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: string;
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

      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        {value}
      </Typography>
    </div>
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
