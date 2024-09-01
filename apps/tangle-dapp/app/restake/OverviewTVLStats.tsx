'use client';

import StatItem from '../../components/StatItem'
import useRestakeTVL from '../../data/restake/useRestakeTVL';
import { tvlToDisplay } from './utils';

const OverviewTVLStats = () => {
  const { totalNetworkTVL, totalDelegatorTVL } = useRestakeTVL()

  return (
    <div className="flex justify-end gap-6 pt-3 border-t border-mono-0 dark:border-mono-140">
      <StatItem title={tvlToDisplay(totalDelegatorTVL)} subtitle="My Total Restaked" />

      <StatItem title={tvlToDisplay(totalNetworkTVL)} subtitle="Network TVL" />
    </div>
  )
}

export default OverviewTVLStats
