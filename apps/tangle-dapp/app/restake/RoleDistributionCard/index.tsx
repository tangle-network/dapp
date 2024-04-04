import { Option } from '@polkadot/types';
import { PalletRolesRestakingLedger } from '@polkadot/types/lookup';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';
import { type FC, useMemo } from 'react';

import GlassCard from '../../../components/GlassCard/GlassCard';
import type { RestakingProfileType } from '../../../types';
import convertRecordToAllocation from '../../../utils/convertRecordToAllocation';
import type { DistributionDataType } from './types';

const DistributionChart = dynamic(() => import('./DistributionChart'), {
  ssr: false,
});

type RoleDistributionCardProps = {
  ledger: Option<PalletRolesRestakingLedger> | null;
  profileType?: RestakingProfileType | null;
};

const RoleDistributionCard: FC<RoleDistributionCardProps> = ({
  ledger,
  profileType,
}) => {
  const distribution = useMemo(() => {
    if (!ledger || ledger.isNone) {
      return null;
    }

    const profile = ledger.unwrap().profile;

    const records = profile.isIndependent
      ? profile.asIndependent.records
      : profile.asShared.records;

    const distribution = {} as DistributionDataType;

    for (const record of records) {
      const [service, amount] = convertRecordToAllocation(record);

      if (service) {
        distribution[service] = profile.isShared
          ? profile.asShared.amount.toBn()
          : amount;
      }
    }

    return distribution;
  }, [ledger]);

  return (
    <GlassCard className="justify-between">
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <DistributionChart data={distribution} profileType={profileType} />
    </GlassCard>
  );
};

export default RoleDistributionCard;
