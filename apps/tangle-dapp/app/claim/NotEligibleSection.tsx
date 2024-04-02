import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { Button } from '@webb-tools/webb-ui-components';
import type { FC } from 'react';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';

const NotEligibleSection: FC = () => {
  const { activeAccount } = useWebContext();
  const { toggleModal } = useConnectWallet();

  if (!activeAccount) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ClaimingAccountInput activeAccountAddress={activeAccount.address} />

      <div className="space-y-2">
        <Button isFullWidth onClick={() => toggleModal(true)}>
          Try Another Account
        </Button>
      </div>
    </div>
  );
};

export default NotEligibleSection;
