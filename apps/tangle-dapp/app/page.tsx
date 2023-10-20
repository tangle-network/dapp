import { Typography } from '@webb-tools/webb-ui-components';
import { HeaderChipsContainer } from '../containers/HeaderChipsContainer';
import {
  getValidatorsCount,
  getActiveAndDelegationCount,
  getWaitingCount,
  getIdealStakedPercentage,
  getInflationPercentage,
} from '../data/TopLevelStats';

export default async function Index() {
  const validatorsCount = await getValidatorsCount();
  const { active, delegation } = await getActiveAndDelegationCount();
  const waitingCount = await getWaitingCount();
  const idealStakedPercentage = await getIdealStakedPercentage();
  const inflationPercentage = await getInflationPercentage();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Staking Overview
        </Typography>

        <HeaderChipsContainer />
      </div>

      <div>Validators Count: {validatorsCount}</div>

      <div>Waiting: {waitingCount}</div>

      <div>
        Active: {active} | Delegation: {delegation}
      </div>

      <div>Ideal Staked Percentage: {idealStakedPercentage}%</div>

      <div>Inflation Percentage: {inflationPercentage}%</div>
    </div>
  );
}
