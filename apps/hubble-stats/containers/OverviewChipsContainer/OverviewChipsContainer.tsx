import {
  Chip,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ArrowRightUp, DatabaseLine } from '@webb-tools/icons';

import { getOverviewChipsData } from '../../data';
import { getRoundedDownNumberWith2Decimals } from '../../utils';

export default async function OverviewChipsContainer() {
  const { tvl, deposit } = await getOverviewChipsData();

  return (
    <div className="hidden md:flex items-center gap-4">
      <Chip color="blue" className="normal-case">
        <DatabaseLine size="lg" className="fill-blue-90 dark:fill-blue-30" />
        TVL:{' '}
        {typeof tvl === 'number'
          ? getRoundedDownNumberWith2Decimals(tvl)
          : '-'}{' '}
        webbtTNT
      </Chip>

      <Tooltip>
        <TooltipTrigger>
          <Chip color="blue" className="normal-case">
            <ArrowRightUp
              size="lg"
              className="fill-blue-90 dark:fill-blue-30"
            />
            DEPOSITS:{' '}
            {typeof deposit === 'number'
              ? getRoundedDownNumberWith2Decimals(deposit)
              : '-'}{' '}
            webbtTNT
          </Chip>
        </TooltipTrigger>
        <TooltipBody>
          <Typography variant="body2">Historical Deposit Volume</Typography>
        </TooltipBody>
      </Tooltip>
    </div>
  );
}
