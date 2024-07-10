'use client';

import { BN } from '@polkadot/util';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import AvailableWithdrawCard from '../../../components/LiquidStaking/AvailableWithdrawCard';
import LiquidStakeAndUnstakeCards from '../../../components/LiquidStaking/LiquidStakeAndUnstakeCards';
import SelectTokenModal from '../../../components/LiquidStaking/SelectTokenModal';
import StakedAssetsTable from '../../../components/LiquidStaking/StakedAssetsTable';
import UnstakeRequestsTable from '../../../components/LiquidStaking/UnstakeRequestsTable';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  // Invalid token provided on the URL parameters.
  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-12 items-start">
      <LiquidStakeAndUnstakeCards />

      <AvailableWithdrawCard />

      <StakedAssetsTable />

      <UnstakeRequestsTable />

      <SelectTokenModal
        options={[
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
          { address: '0x123456' as any, amount: new BN(100) },
        ]}
        isOpen
        onClose={() => void 0}
        onTokenSelect={() => void 0}
      />
    </div>
  );
};

export default LiquidStakingTokenPage;
