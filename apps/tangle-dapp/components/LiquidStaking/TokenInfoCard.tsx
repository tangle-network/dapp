import {
  ArrowRightUp,
  ExternalLinkLine,
  InformationLine,
} from '@webb-tools/icons';
import {
  Button,
  IconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import React, { FC } from 'react';

import {
  LiquidStakingToken,
  TANGLE_LS_PREFIX_TOKEN_SYMBOL,
} from '../../constants/liquidStaking';
import useLSTokenSVGs from '../../hooks/useLSTokenSVGs';

type TokenInfoProps = {
  title: string;
  tooltip?: string;
  value: string;
  valueTooltip?: string;
};

type TokenInfoCardProps = {
  stakingInfo: TokenInfoProps;
  availableInfo: TokenInfoProps;
  unstakingInfo: TokenInfoProps;
  apyInfo: TokenInfoProps;
  tokenSymbol: string;
  tokenSVG?: React.FC<React.SVGProps<SVGSVGElement>>;
};

const TokenInfoCard = ({
  stakingInfo,
  availableInfo,
  unstakingInfo,
  apyInfo,
  tokenSymbol,
}: TokenInfoCardProps) => {
  const TokenSVG = useLSTokenSVGs(tokenSymbol as LiquidStakingToken);

  return (
    <div className="max-w-[684px] h-fit p-[20px] flex justify-between relative bg-token_info_card dark:bg-token_info_card_dark rounded-2xl border-[1px] border-mono-0 dark:border-mono-160">
      <div className="flex flex-col gap-[30px] flex-grow z-10">
        <div className="grid gap-y-[30px] grid-cols-2 grid-rows-2">
          <GridItem
            title={stakingInfo.title}
            tooltip={stakingInfo.tooltip}
            value={stakingInfo.value}
            valueTooltip={stakingInfo.valueTooltip}
            tokenSymbol={tokenSymbol}
          />

          <GridItem
            title={availableInfo.title}
            tooltip={availableInfo.tooltip}
            value={availableInfo.value}
            valueTooltip={availableInfo.valueTooltip}
            tokenSymbol={TANGLE_LS_PREFIX_TOKEN_SYMBOL + tokenSymbol}
          />

          <GridItem
            title={unstakingInfo.title}
            tooltip={unstakingInfo.tooltip}
            value={unstakingInfo.value}
            valueTooltip={unstakingInfo.valueTooltip}
            tokenSymbol={tokenSymbol}
            fw="normal"
          />

          <GridItem
            title={apyInfo.title}
            tooltip={apyInfo.tooltip}
            value={apyInfo.value}
            valueTooltip={apyInfo.valueTooltip}
            fw="normal"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            rightIcon={
              <ArrowRightUp className="fill-mono-0 dark:!fill-mono-180" />
            }
          >
            Restake
          </Button>

          <Button
            variant="secondary"
            rightIcon={<ExternalLinkLine className="" />}
          >
            Explorer
          </Button>
        </div>
      </div>

      <div className="absolute top-3 right-0 z-0">
        {TokenSVG && <TokenSVG />}
      </div>
    </div>
  );
};

type GridItemProps = {
  title: string;
  tooltip?: string;
  value: string;
  valueTooltip?: string;
  tokenSymbol?: string;
  fw?: 'normal' | 'bold';
};

/** @internal */
const GridItem: FC<GridItemProps> = ({
  title,
  tooltip,
  value,
  valueTooltip,
  tokenSymbol,
  fw,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <Typography
          variant="h5"
          fw={fw ?? 'bold'}
          className="text-mono-100 dark:text-mono-100"
        >
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

      <div className="flex items-center gap-1">
        <Typography
          variant="h4"
          fw={fw ?? 'bold'}
          className="text-mono-200 dark:text-mono-0"
        >
          {value}
        </Typography>

        <Typography
          variant="h4"
          fw={fw ?? 'bold'}
          className="text-mono-100 dark:text-mono-100"
        >
          {tokenSymbol}
        </Typography>

        {valueTooltip !== undefined && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-140 dark:fill-mono-100" />
            }
            content={valueTooltip}
            overrideTooltipBodyProps={{
              className: 'max-w-[350px]',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TokenInfoCard;
