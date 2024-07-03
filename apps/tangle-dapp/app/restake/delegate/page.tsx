import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { Fragment } from 'react';

import RestakeTabs from '../RestakeTabs';
import DepositButton from './DepositButton';

export default function DelegatePage() {
  return (
    <Fragment>
      <RestakeTabs />

      <div className="flex flex-col items-center justify-center space-y-3 grow">
        <Typography variant="h5" ta="center" fw="semibold">
          🚧 The delegation feature is under development 🚧
        </Typography>
        <Typography variant="body1" ta="center" fw="medium">
          Now, you can try the deposit feature. Stay tuned for updates!
        </Typography>

        <DepositButton />
      </div>
    </Fragment>
  );
}
