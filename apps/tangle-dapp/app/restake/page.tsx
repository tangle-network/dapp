'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';
import StatItem from '../../components/StatItem';
import useRestakeDelegatorInfo from '../../data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '../../data/restake/useRestakeOperatorMap';
import useRestakeTVL from '../../data/restake/useRestakeTVL';
import getTVLToDisplay from '../../utils/getTVLToDisplay';
import TableTabs from './TableTabs';

export const dynamic = 'force-static';

const CONTENT = {
  OVERVIEW: (
    <>
      Operators on Tangle provide computation resources to power AVS Blueprints.
      <b>&nbsp;Deposit and Delegate liquidity to earn yields.</b>
    </>
  ),
  HOW_IT_WORKS:
    'Tangle combines restaking with omnichain assets to provide a multi-asset crypto-economically secured compute infrastructure.',
} as const;

const minHeightClsx = 'min-h-[233px]';

export default function RestakePage() {
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();

  const {
    delegatorTVL,
    operatorConcentration,
    operatorTVL,
    poolTVL,
    totalDelegatorTVL,
    totalNetworkTVL,
  } = useRestakeTVL(operatorMap, delegatorInfo);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 md:flex-row">
        <GlassCard
          className={twMerge(
            'justify-between',
            minHeightClsx,
            '[background:linear-gradient(79deg,_#b6b8dd_8.85%,_#d9ddf2_55.91%,_#dbbdcd_127.36%),_#fff]',
            'dark:[background:linear-gradient(79deg,_rgba(30,_32,_65,_0.8)_8.85%,_rgba(38,_52,_116,_0.8)_55.91%,_rgba(113,_61,_89,_0.8)_127.36%)]',
          )}
        >
          <Typography
            variant="body1"
            className="text-mono-200 dark:text-mono-0 max-w-[510px] pb-3"
          >
            {CONTENT.OVERVIEW}
          </Typography>

          <div className="flex justify-end gap-6 pt-3 border-t border-mono-0 dark:border-mono-140">
            <StatItem
              title={getTVLToDisplay(totalDelegatorTVL)}
              subtitle="My Total Restaked"
            />

            <StatItem
              title={getTVLToDisplay(totalNetworkTVL)}
              subtitle="Network TVL"
            />
          </div>
        </GlassCard>

        <GlassCard
          className={twMerge(minHeightClsx, 'md:max-w-[442px] justify-between')}
        >
          <div>
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0 mb-2.5"
            >
              How it works
            </Typography>

            <Typography variant="body1">{CONTENT.HOW_IT_WORKS}</Typography>
          </div>

          {/** TODO: Determine read more link here */}
          <Button
            href="#"
            variant="link"
            size="sm"
            className="inline-block ml-auto"
          >
            Read more
          </Button>
        </GlassCard>
      </div>

      <TableTabs
        delegatorTVL={delegatorTVL}
        operatorMap={operatorMap}
        delegatorInfo={delegatorInfo}
        operatorTVL={operatorTVL}
        vaultTVL={poolTVL}
        operatorConcentration={operatorConcentration}
      />
    </div>
  );
}
