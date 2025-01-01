import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { type ReactNode, useMemo } from 'react';

type Props = {
  targetTypedChainId?: number;
  children: (isLoading: boolean, loadingText?: string) => ReactNode;
};

export default function ActionButtonBase({
  targetTypedChainId,
  children,
}: Props) {
  const { loading, isConnecting, activeWallet } = useWebContext();
  const { toggleModal } = useConnectWallet();

  const { isLoading, loadingText } = useMemo(() => {
    if (loading)
      return {
        isLoading: true,
      };

    if (isConnecting)
      return {
        isLoading: true,
        loadingText: 'Connecting',
      };

    return {
      isLoading: false,
    };
  }, [isConnecting, loading]);

  // If the user is not connected to a wallet, show the connect wallet button
  if (activeWallet === undefined) {
    return (
      <Button
        type="button"
        isFullWidth
        isLoading={isLoading}
        loadingText={loadingText}
        onClick={() => toggleModal(true, targetTypedChainId)}
      >
        Connect Wallet
      </Button>
    );
  }

  return children(isLoading, loadingText);
}
