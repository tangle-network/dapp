import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { Button } from '@webb-tools/webb-ui-components';
import type { FC } from 'react';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';

const NotEligibleSection: FC = () => {
  const activeAccountAddress = useActiveAccountAddress();
  const { toggleModal } = useConnectWallet();

  if (activeAccountAddress === null) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ClaimingAccountInput activeAccountAddress={activeAccountAddress} />

      <div className="space-y-2">
        <Button isFullWidth onClick={() => toggleModal(true)}>
          Try Another Account
        </Button>
      </div>
    </div>
  );
};

export default NotEligibleSection;
