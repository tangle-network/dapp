import {
  Button,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { useTheme } from 'next-themes';
import { FC, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useBalances from '../../data/balances/useBalances';
import convertToChainUnits from '../../utils/convertToChainUnits';
import { formatTokenBalance } from '../../utils/polkadot';
import AmountAndRoleComboInput from './AmountAndRoleComboInput';

const AllocationStep: FC = () => {
  const { transferrable: transferrableBalance } = useBalances();
  const themeProps = useTheme();
  const themeCellColor = themeProps.theme === 'dark' ? '#3A3E53' : '#8884d8';

  const [restakedAmount, setRestakedAmount] = useState(
    convertToChainUnits(500)
  );

  const formattedRestakedAmount = formatTokenBalance(restakedAmount);

  const usedRatio =
    transferrableBalance === null
      ? 0
      : // It's safe to convert to a number here, since the
        // value will always be fraction between 0 and 1.
        restakedAmount.muln(100).div(transferrableBalance).toNumber() / 100;

  console.debug(
    'usedRatio',
    usedRatio,
    transferrableBalance?.toString(),
    restakedAmount.toString()
  );

  const data = [
    { name: ['used'], value: usedRatio },
    { name: ['remaining'], value: 1 - usedRatio },
  ];

  return (
    <div className="flex gap-5 items-start justify-center">
      <div className="flex flex-col gap-4 items-end justify-start min-w-max">
        <AmountAndRoleComboInput title="Total Restake" id="role1" />

        <Button size="sm" variant="utility" className="uppercase">
          Add Role
        </Button>
      </div>

      <div className="relative flex items-center justify-center w-full">
        <Tooltip>
          <TooltipTrigger>
            <PieChart width={190} height={190}>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={95}
                stroke="none"
                fill="#8884d8"
                dataKey="value"
                accumulate="sum"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="#B8D6FF" />

                <Cell fill={themeCellColor} />
              </Pie>
            </PieChart>
          </TooltipTrigger>

          <TooltipBody>
            {transferrableBalance !== null ? (
              <>
                Remaining:{' '}
                {formatTokenBalance(transferrableBalance.sub(restakedAmount))}
              </>
            ) : (
              <SkeletonLoader />
            )}
          </TooltipBody>
        </Tooltip>

        <div className="absolute center flex flex-col justify-center items-center gap-1">
          <Typography
            variant="body2"
            fw="normal"
            className="dark:text-mono-120"
          >
            Restaked
          </Typography>

          <Typography
            variant="h5"
            fw="bold"
            className="dark:text-mono-0 text-center"
          >
            {formatTokenBalance(restakedAmount, false)}
          </Typography>

          <Typography variant="body1" className="dark:text-mono-40">
            {TANGLE_TOKEN_UNIT}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AllocationStep;
