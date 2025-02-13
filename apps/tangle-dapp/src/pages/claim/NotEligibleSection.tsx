import { useConnectWallet } from '@tangle-network/api-provider-environment/ConnectWallet';
import { Button } from '@tangle-network/webb-ui-components';
import type { FC } from 'react';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';

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
