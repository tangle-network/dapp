'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { ComputerIcon } from '@webb-tools/icons';
import {
  Button,
  ConnectWalletMobileButton,
  Typography,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';

const ActionButton = () => {
  const { loading, isConnecting, activeAccount, activeWallet } =
    useWebContext();

  const { toggleModal } = useConnectWallet();

  const { isMobile } = useCheckMobile();

  if (isMobile) {
    return (
      <ConnectWalletMobileButton>
        <div className="flex flex-col items-center justify-center gap-4 py-9">
          <ComputerIcon size="xl" className="mx-auto" />
          <Typography variant="body1" className="text-center">
            For the best staking experience, we recommend using our desktop
            interface for full-feature interface and enhanced controls.
          </Typography>
        </div>
      </ConnectWalletMobileButton>
    );
  }

  if (activeAccount && activeWallet) {
    return <Button>Manage Profile</Button>;
  }

  return (
    <Button
      isDisabled={loading || isConnecting}
      isLoading={loading || isConnecting}
      loadingText="Connecting..."
      onClick={() => toggleModal(true)}
    >
      Connect Wallet
    </Button>
  );
};

export default ActionButton;
