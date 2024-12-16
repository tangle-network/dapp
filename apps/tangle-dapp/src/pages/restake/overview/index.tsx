import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import {
  Card,
  CardVariant,
} from '@webb-tools/webb-ui-components/components/Card';
import { TANGLE_DOCS_RESTAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { twMerge } from 'tailwind-merge';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import getTVLToDisplay from '@webb-tools/tangle-shared-ui/utils/getTVLToDisplay';
import StatItem from '../../../components/StatItem';
import useRestakeTVL from '../../../data/restake/useRestakeTVL';
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
            'justify-between min-h-60 flex-1',
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
