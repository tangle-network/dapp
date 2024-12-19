import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';
import getTVLToDisplay from '@webb-tools/tangle-shared-ui/utils/getTVLToDisplay';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import {
  Card,
  CardVariant,
} from '@webb-tools/webb-ui-components/components/Card';
import { TANGLE_DOCS_RESTAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { twMerge } from 'tailwind-merge';
import StatItem from '../../../components/StatItem';
import { CONTENT } from './shared';
import TableTabs from './TableTabs';

export default function RestakePage() {
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();

  const {
    delegatorTVL,
    operatorConcentration,
    operatorTVL,
    vaultTVL,
    totalDelegatorTVL,
    totalNetworkTVL,
  } = useRestakeTVL(operatorMap, delegatorInfo);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 md:flex-row">
        <Card
          variant={CardVariant.GLASS}
          className={twMerge(
            'flex flex-col justify-between min-h-60 flex-1',
            'bg-purple_gradient dark:bg-purple_gradient_dark',
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
        </Card>

        <Card
          variant={CardVariant.GLASS}
          className={twMerge(
            'min-h-60 flex-1',
            'md:max-w-[442px] justify-between',
          )}
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

          <Button
            href={TANGLE_DOCS_RESTAKING_URL}
            target="_blank"
            variant="link"
            size="sm"
            className="inline-block ml-auto"
          >
            Read more
          </Button>
        </Card>
      </div>

      <TableTabs
        delegatorTVL={delegatorTVL}
        operatorMap={operatorMap}
        delegatorInfo={delegatorInfo}
        operatorTVL={operatorTVL}
        vaultTVL={vaultTVL}
        operatorConcentration={operatorConcentration}
      />
    </div>
  );
}
