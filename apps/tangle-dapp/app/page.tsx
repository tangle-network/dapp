import { Typography } from '@webb-tools/webb-ui-components';
import { HeaderChipsContainer } from '../containers/HeaderChipsContainer';

export default async function Index() {
  return (
    <div className="flex items-center justify-between">
      <Typography variant="h4" fw="bold">
        Staking Overview
      </Typography>

      <HeaderChipsContainer />
    </div>
  );
}
