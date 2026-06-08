import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@tangle-network/sandbox-ui/primitives';
import useLocalChainGuard from '@tangle-network/tangle-shared-ui/hooks/useLocalChainGuard';
import useNetworkSync from '@tangle-network/tangle-shared-ui/hooks/useNetworkSync';
import { IndexerStatusProvider } from '@tangle-network/tangle-shared-ui/context/IndexerStatusContext';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { isLocalPreviewHost } from '@tangle-network/tangle-shared-ui/utils/localPreview';
import { FC, type PropsWithChildren, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import {
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  TANGLE_CLOUD_NETWORKS,
} from '../constants/networks';
import { cloudWagmiConfig } from './cloudWagmiConfig';
import PaymentProviders from './PaymentProviders';

// Component to sync network store with wagmi chain
const NetworkSync: FC<PropsWithChildren> = ({ children }) => {
  const forceLocalChain = import.meta.env.VITE_FORCE_LOCAL_CHAIN === 'true';
  const selectedNetwork = useNetworkStore((store) => store.network2);
  const setNetwork = useNetworkStore((store) => store.setNetwork);

  const needsCloudNetworkReset =
    !forceLocalChain &&
    selectedNetwork?.evmChainId === ANVIL_LOCAL_NETWORK.evmChainId;

  useEffect(() => {
    if (needsCloudNetworkReset) {
      setNetwork(BASE_SEPOLIA_NETWORK);
    }
  }, [needsCloudNetworkReset, setNetwork]);

  useNetworkSync(TANGLE_CLOUD_NETWORKS);
  useLocalChainGuard({
    enabled: forceLocalChain && isLocalPreviewHost(),
    targetChainId: ANVIL_LOCAL_NETWORK.evmChainId ?? 31337,
  });
  if (needsCloudNetworkReset) {
    return null;
  }

  return children;
};

const ToastAccessibilityPatch = () => {
  useEffect(() => {
    const applyRole = () => {
      document
        .querySelectorAll('[aria-label="Notifications"]')
        .forEach((element) => {
          if (element instanceof HTMLElement && !element.getAttribute('role')) {
            element.setAttribute('role', 'status');
          }
        });
    };

    applyRole();
    const observer = new MutationObserver(applyRole);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
};

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  const reconnectOnMount = (() => {
    const override = import.meta.env.VITE_WALLET_RECONNECT_ON_MOUNT;
    if (override === 'true') return true;
    if (override === 'false') return false;
    return false;
  })();

  return (
    <WagmiProvider
      config={cloudWagmiConfig}
      reconnectOnMount={reconnectOnMount}
    >
      <QueryClientProvider client={queryClient}>
        <NetworkSync>
          <IndexerStatusProvider>
            <ToastProvider>
              <ToastAccessibilityPatch />
              <PaymentProviders>{children}</PaymentProviders>
            </ToastProvider>
          </IndexerStatusProvider>
        </NetworkSync>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
