import { BN } from '@polkadot/util';
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
import { ServiceType } from '../../types';
import convertToChainUnits from '../../utils/convertToChainUnits';
import { formatTokenBalance } from '../../utils/polkadot';
import AmountAndRoleComboInput from './AmountAndRoleComboInput';

const AllocationStep: FC = () => {
  const { transferrable: transferrableBalance } = useBalances();
  const themeProps = useTheme();
  const themeCellColor = themeProps.theme === 'dark' ? '#3A3E53' : '#8884d8';
  const [newAllocationAmount, setNewAllocationAmount] = useState(new BN(0));

  const [newAllocationRole, setNewAllocationRole] =
    useState<ServiceType | null>(null);

  // TODO: Need to load initial restaked amount from Polkadot API. For now, it's hardcoded to 0. Will likely need a `useEffect` hook for this, since it requires an active account.
  const [restakedAmount, setRestakedAmount] = useState(convertToChainUnits(0));

  const usedRatio =
    transferrableBalance === null
      ? 0
      : // It's safe to convert to a number here, since the
        // value will always be fraction between 0 and 1.
        restakedAmount.muln(100).div(transferrableBalance).toNumber() / 100;

  const data = [
    { name: ['used'], value: usedRatio },
    { name: ['remaining'], value: 1 - usedRatio },
  ];

  const [allocations, setAllocations] = useState<
    Record<ServiceType, BN | null>
  >({
    [ServiceType.DKG_TSS_CGGMP]: null,
    [ServiceType.TX_RELAY]: null,
    [ServiceType.ZK_SAAS_GROTH16]: null,
    [ServiceType.ZK_SAAS_MARLIN]: null,
  });

  const amountRemaining = transferrableBalance?.sub(restakedAmount) ?? null;

  const handleNewAllocation = () => {
    if (newAllocationRole === null) {
      return;
    }

    setAllocations((prev) => ({
      ...prev,
      [newAllocationRole]: restakedAmount,
    }));

    const newRestakedAmount = restakedAmount.add(newAllocationAmount);

    setRestakedAmount(newRestakedAmount);
    setNewAllocationRole(null);
  };

  const isNewAllocationAmountValid = (() => {
    if (
      newAllocationRole === null ||
      newAllocationAmount.isZero() ||
      amountRemaining === null ||
      amountRemaining.isZero()
    ) {
      return false;
    }

    return newAllocationAmount.lte(amountRemaining);
  })();

  return (
    <div className="flex gap-5 items-start justify-center">
      <div className="flex flex-col gap-4 items-end justify-start min-w-max">
        {Object.entries(allocations)
          .filter((entry) => entry[1] !== null)
          .map(([role, amount]) => (
            <AmountAndRoleComboInput
              key={role}
              title="Total Restake"
              id={`manage-profile-allocation-${role}`}
              role={role as ServiceType}
              setRole={setNewAllocationRole}
            />
          ))}

        <AmountAndRoleComboInput
          title="Total Restake"
          id="role1"
          role={newAllocationRole}
          setRole={setNewAllocationRole}
          onChange={setNewAllocationAmount}
        />

        <Button
          size="sm"
          variant="utility"
          className="uppercase"
          onClick={handleNewAllocation}
          isDisabled={!isNewAllocationAmountValid}
        >
          Add Allocation
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

        <div className="absolute center flex flex-col justify-center items-center">
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

          <Typography variant="body2" className="dark:text-mono-120">
            {TANGLE_TOKEN_UNIT}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AllocationStep;
