import { EvmWalletModal } from '@tangle-network/tangle-shared-ui/components/EvmWalletModal';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC, type ReactNode, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

type Props = {
  targetTypedChainId?: number;
  children: (isLoading: boolean, loadingText?: string) => ReactNode;
};

const ActionButtonBase: FC<Props> = ({
  targetTypedChainId: _targetTypedChainId,
  children,
}) => {
  const { isConnected, isConnecting } = useAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { isLoading, loadingText } = useMemo(() => {
    if (isConnecting) {
      return {
        isLoading: true,
        loadingText: 'Connecting',
      };
    }

    return { isLoading: false };
  }, [isConnecting]);

  // If the user is not connected to a wallet, show the connect wallet button.
  // `targetTypedChainId` is kept for API parity with legacy flow.
  if (!isConnected) {
    return (
      <>
        <Button
          type="button"
          isFullWidth
          isLoading={isLoading}
          loadingText={loadingText}
          onClick={() => setIsWalletModalOpen(true)}
        >
          Connect Wallet
        </Button>

        <EvmWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
      </>
    );
  }

  return children(isLoading, loadingText);
};

export default ActionButtonBase;
