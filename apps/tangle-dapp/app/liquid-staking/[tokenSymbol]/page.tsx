'use client';

import { notFound } from 'next/navigation';
import { FC, useMemo, useState } from 'react';

import LiquidStakingCard from '../../../components/LiquidStaking/LiquidStakingCard';
import TokenInfoCard from '../../../components/LiquidStaking/TokenInfoCard';
import ValidatorSelectionTable from '../../../components/LiquidStaking/ValidatorSelectionTable';
import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LS_NETWORK_CONFIG,
  NetworkType,
} from '../../../constants/liquidStaking';
import { useLiquidStakingStore } from '../../../data/liquidStaking/store';
import useValidatorsAndCollators from '../../../data/liquidStaking/useValidatorsAndCollators';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const { selectedChain } = useLiquidStakingStore();

  const selectedNetwork = useMemo(() => {
    return LS_NETWORK_CONFIG[selectedChain];
  }, [selectedChain]);

  const {
    isLoading,
    data: { validators, collators },
  } = useValidatorsAndCollators();

  const [selectedValidatorsOrCollators, setSelectedvalidatorsOrCollators] =
    useState<Set<string>>(new Set());

  console.debug('Selected Validators:', selectedValidatorsOrCollators);

  // Invalid token provided on the URL parameters.
  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="flex flex-col gap-4">
        <TokenInfoCard
          stakingInfo={{
            title: 'Staking',
            tooltip: `Total staked ${tokenSymbol}`,
            value: '-',
          }}
          availableInfo={{
            title: 'Available',
            tooltip: `Available ${LIQUID_STAKING_TOKEN_PREFIX}${tokenSymbol}`,
            value: '98.00',
            valueTooltip: `Available ${LIQUID_STAKING_TOKEN_PREFIX}${tokenSymbol}`,
          }}
          unstakingInfo={{
            title: 'Unstaking',
            tooltip: `Total unstaking ${tokenSymbol} in progress`,
            value: '-',
          }}
          apyInfo={{
            title: 'APY',
            tooltip: 'APY (Annual Percentage Yield) %',
            value: '-',
          }}
          tokenSymbol={tokenSymbol}
        />

        {/* Validator Selection Component */}
        <ValidatorSelectionTable
          data={
            selectedNetwork.chainType === NetworkType.RELAY_CHAIN
              ? validators
              : collators
          }
          // data={[]}
          setSelectedvalidatorsOrCollators={setSelectedvalidatorsOrCollators}
          tableType={
            selectedNetwork.chainType === NetworkType.RELAY_CHAIN
              ? 'validators'
              : 'collators'
          }
          isLoading={isLoading}
        />
      </div>

      <LiquidStakingCard />
    </div>
  );
};

export default LiquidStakingTokenPage;
