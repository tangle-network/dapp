import type { Account } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { Button } from '@webb-tools/webb-ui-components';
import type { FC } from 'react';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';

type Props = {
  checkEligibility: (activeAccount: Account, force?: boolean) => Promise<void>;
};

const NotEligibleSection: FC<Props> = ({ checkEligibility }) => {
  const { activeAccount } = useWebContext();

  if (!activeAccount) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ClaimingAccountInput activeAccountAddress={activeAccount.address} />

      <Button isFullWidth onClick={() => checkEligibility(activeAccount, true)}>
        Try Again
      </Button>
    </div>
  );
};

export default NotEligibleSection;
