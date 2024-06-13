'use client';

import { ArrowDownIcon } from '@radix-ui/react-icons';
import { InformationLine } from '@webb-tools/icons';
import {
  Button,
  ExternalLinkIcon,
  IconWithTooltip,
  shortenHex,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import React, { FC, useState } from 'react';

import {
  LiquidStakingToken,
  TANGLE_LS_PREFIX_TOKEN_SYMBOL,
} from '../../constants/liquidStaking';
import LiquidStakingInput from './LiquidStakingInput';

type LiquidStakingCardProps = {
  tokenSymbol: string;
};

const LiquidStakingCard: FC<LiquidStakingCardProps> = ({ tokenSymbol }) => {
  const [txType, setTxType] = useState<'stake' | 'unstake'>('stake');

  return (
    <div className="flex flex-col gap-4 w-full min-w-[550px] max-w-[650px] bg-mono-0 dark:bg-mono-190 rounded-2xl p-9 border-[1px] border-mono-40 dark:border-mono-160">
      {/* Card Title */}
      <div className="flex gap-3">
        <Typography
          className={cx(
            'cursor-pointer',
            txType === 'stake'
              ? 'text-mono-200 dark:text-mono-0'
              : 'text-mono-100 dark:text-mono-100',
          )}
          variant="h4"
          fw="bold"
          onClick={() => setTxType('stake')}
        >
          Stake
        </Typography>

        <Typography
          className={cx(
            'cursor-pointer',
            txType === 'unstake'
              ? 'text-mono-200 dark:text-mono-0'
              : 'text-mono-100 dark:text-mono-100',
          )}
          variant="h4"
          fw="bold"
          onClick={() => setTxType('unstake')}
        >
          Unstake
        </Typography>
      </div>

      {/* Tx Inputs Container */}
      <div className="flex flex-col items-center gap-2">
        <LiquidStakingInput
          id="liquid-staking-from"
          selectedToken={LiquidStakingToken.DOT}
        />

        <ArrowDownIcon className="dark:fill-mono-0 self-center w-6 h-6" />

        <LiquidStakingInput
          id="liquid-staking-to"
          selectedToken={LiquidStakingToken.DOT}
        />
      </div>

      {/* Tx Details */}
      <TxDetails
        rate={{ tooltip: 'This is a test', value: 0.982007 }}
        crossChainFee={{ tooltip: 'This is a test', value: 0.19842 }}
        unstakePeriod={{ tooltip: 'This is a test', value: 7 }}
        tokenAddress={{
          value: '0x2E3Bd8C8215DE1F6ce568482670F7a2eCA5f01E7',
          explorerLink: 'http://test',
        }}
        tokenSymol={tokenSymbol}
      />

      {/* Tx Button */}
      {txType === 'stake' ? (
        <Button isFullWidth>Stake</Button>
      ) : (
        <Button isFullWidth>Unstake</Button>
      )}
    </div>
  );
};

type TxDetailsProps = {
  rate: {
    tooltip?: string;
    value: number;
  };
  crossChainFee: {
    tooltip?: string;
    value: number;
  };
  unstakePeriod: {
    tooltip?: string;
    value: number;
  };
  tokenAddress: {
    tooltip?: string;
    value: string;
    explorerLink?: string;
  };
  tokenSymol: string;
};

const DetailRow: FC<{
  label: string;
  value: string | React.ReactNode;
  tooltip?: string;
  extra?: React.ReactNode;
}> = ({ label, value, tooltip, extra }) => (
  <div className="flex gap-2 justify-between w-full">
    <div className="flex items-center gap-1">
      <Typography
        variant="body1"
        fw="bold"
        className="text-mono-120 dark:text-mono-100"
      >
        {label}
      </Typography>
      {tooltip && (
        <IconWithTooltip
          icon={
            <InformationLine className="fill-mono-120 dark:fill-mono-100" />
          }
          content={tooltip}
          overrideTooltipBodyProps={{ className: 'max-w-[350px]' }}
        />
      )}
    </div>
    <div className="flex gap-1 items-baseline">
      {typeof value === 'string' ? (
        <Typography
          className="text-mono-200 dark:text-mono-40"
          variant="body1"
          fw="bold"
        >
          {value}
        </Typography>
      ) : (
        value
      )}
      {extra}
    </div>
  </div>
);

const TxDetails: FC<TxDetailsProps> = ({
  rate,
  crossChainFee,
  unstakePeriod,
  tokenAddress,
  tokenSymol,
}) => {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-mono-20 dark:bg-mono-180">
      <DetailRow
        label="Rate"
        value={
          <>
            <Typography
              className="text-mono-200 dark:text-mono-40"
              variant="body1"
              fw="bold"
            >
              1
            </Typography>
            <Typography
              className="text-mono-200 dark:text-mono-40"
              variant="body3"
              fw="normal"
            >
              {tokenSymol}
            </Typography>
            <Typography
              className="text-mono-200 dark:text-mono-40"
              variant="body1"
              fw="bold"
            >
              =
            </Typography>
            <Typography
              className="text-mono-200 dark:text-mono-40"
              variant="body1"
              fw="bold"
            >
              {rate.value}
            </Typography>
            <Typography
              className="text-mono-200 dark:text-mono-40"
              variant="body3"
              fw="normal"
            >
              {TANGLE_LS_PREFIX_TOKEN_SYMBOL + tokenSymol}
            </Typography>
          </>
        }
        tooltip={rate.tooltip}
      />

      <DetailRow
        label="Cross-chain Fee"
        value={crossChainFee.value}
        extra={
          <Typography
            className="text-mono-200 dark:text-mono-40"
            variant="body3"
            fw="normal"
          >
            TNT
          </Typography>
        }
        tooltip={crossChainFee.tooltip}
      />

      <DetailRow
        label="Unstake period"
        value={unstakePeriod.value}
        extra={
          <Typography
            className="text-mono-200 dark:text-mono-40"
            variant="body3"
            fw="normal"
          >
            days
          </Typography>
        }
        tooltip={unstakePeriod.tooltip}
      />

      <DetailRow
        label="Token address"
        value={
          <Typography
            className="text-mono-200 dark:text-mono-40"
            variant="body1"
            fw="bold"
            onClick={() =>
              tokenAddress.explorerLink &&
              window.open(tokenAddress.explorerLink)
            }
          >
            {shortenHex(tokenAddress.value, 5)}
          </Typography>
        }
        tooltip={tokenAddress.tooltip}
        extra={
          tokenAddress.explorerLink && (
            <ExternalLinkIcon href={tokenAddress.explorerLink} />
          )
        }
      />
    </div>
  );
};

export default LiquidStakingCard;
