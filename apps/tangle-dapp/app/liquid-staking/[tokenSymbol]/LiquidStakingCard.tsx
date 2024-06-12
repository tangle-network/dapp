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
import { FC, useCallback } from 'react';

import { LiquidStakingToken } from '../../../constants/liquidStaking';
import useMintTx from '../../../data/liquidStaking/useMintTx';
import LiquidStakingInput from './LiquidStakingInput';

const LiquidStakingCard: FC = () => {
  const { execute: executeMintTx } = useMintTx();

  const handleStakeClick = useCallback(() => {
    if (executeMintTx === null) {
      return;
    }

    executeMintTx({
      amount: new BN(50000000000),
      currency: 'Bnc',
    });
  }, [executeMintTx]);

  return (
    <div className="flex flex-col gap-4 w-full min-w-[550px] max-w-[650px] dark:bg-mono-190 rounded-lg p-9">
      <div className="flex gap-3">
        <Typography className="dark:text-mono-0" variant="h4" fw="bold">
          Stake
        </Typography>

        <Typography className="dark:text-mono-100" variant="h4" fw="bold">
          Unstake
        </Typography>
      </div>

      <LiquidStakingInput
        id="liquid-staking-from"
        selectedToken={LiquidStakingToken.DOT}
      />

      <ArrowDownIcon className="dark:fill-mono-0 self-center w-7 h-7" />

      <LiquidStakingInput
        id="liquid-staking-to"
        selectedToken={LiquidStakingToken.DOT}
      />

      {/* Details */}
      <div className="flex flex-col gap-2 p-3 dark:bg-mono-180 rounded-lg">
        <DetailItem
          title="Rate"
          tooltip="This is a test."
          value="1 DOT = 0.982007 tgDOT"
        />

        <DetailItem
          title="Cross-chain fee"
          tooltip="This is a test."
          value="0.19842 TNT"
        />

        <DetailItem
          title="Unstake period"
          tooltip="This is a test."
          value="7 days"
        />
      </div>

      <Button
        isDisabled={executeMintTx === null}
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
        <Typography variant="body1" fw="bold">
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
