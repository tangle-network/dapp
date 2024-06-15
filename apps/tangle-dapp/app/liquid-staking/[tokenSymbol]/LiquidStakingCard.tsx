'use client';

import { BN } from '@polkadot/util';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { InformationLine, Search } from '@webb-tools/icons';
import {
  Button,
  Chip,
  IconWithTooltip,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChain,
  LS_CHAIN_TO_TOKEN,
} from '../../../constants/liquidStaking';
import useMintTx from '../../../data/liquidStaking/useMintTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import SelectValidators from '../SelectValidators';
import WalletBalance from '../WalletBalance';
import LiquidStakingInput from './LiquidStakingInput';

const LiquidStakingCard: FC = () => {
  const [fromAmount, setFromAmount] = useState<BN | null>(null);

  // TODO: The rate will likely be a hook on its own, likely needs to be extracted from the Tangle Restaking Parachain via a query/subscription.
  const [rate] = useState<number | null>(1.3);

  const [selectedChain, setSelectedChain] = useState<LiquidStakingChain>(
    LiquidStakingChain.Polkadot,
  );

  const selectedChainToken = LS_CHAIN_TO_TOKEN[selectedChain];

  const { execute: executeMintTx, status: mintTxStatus } = useMintTx();

  const handleStakeClick = useCallback(() => {
    if (executeMintTx === null || fromAmount === null) {
      return;
    }

    executeMintTx({
      amount: fromAmount,
      currency: 'Bnc',
    });
  }, [executeMintTx, fromAmount]);

  const toAmount = useMemo(() => fromAmount?.muln(2) ?? null, [fromAmount]);

  return (
    <div className="flex flex-col gap-4 w-full min-w-[550px] max-w-[650px] bg-mono-0 dark:bg-mono-190 rounded-2xl p-9 border dark:border-mono-160 shadow-sm">
      <div className="flex gap-3">
        <Typography className="dark:text-mono-0" variant="h4" fw="bold">
          Stake
        </Typography>

        <Typography
          className="text-mono-100 dark:text-mono-100"
          variant="h4"
          fw="bold"
        >
          Unstake
        </Typography>
      </div>

      <LiquidStakingInput
        id="liquid-staking-from"
        selectedChain={selectedChain}
        amount={fromAmount}
        setAmount={setFromAmount}
        placeholder={`0 ${selectedChainToken}`}
        rightElement={<WalletBalance />}
        setChain={setSelectedChain}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-to"
        selectedChain={selectedChain}
        placeholder={`0 ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChainToken}`}
        amount={toAmount}
        isReadOnly
        isLiquidVariant
        rightElement={<SelectValidators />}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 bg-mono-20 dark:bg-mono-180 rounded-lg">
        <DetailItem
          title="Rate"
          tooltip="This is a test."
          value={`1 ${selectedChainToken} = ${rate} ${LIQUID_STAKING_TOKEN_PREFIX}${selectedChainToken}`}
        />

        <DetailItem
          title="Cross-chain fee"
          tooltip="This is a test."
          value={`0.001984 ${selectedChainToken}`}
        />

        <DetailItem
          title="Unstake period"
          tooltip="The period of time you need to wait before you can unstake your tokens."
          value="7 days"
        />

        <DetailItem title="Token address" value="0xbe507...00006" />
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
    </div>
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

export default LiquidStakingCard;
