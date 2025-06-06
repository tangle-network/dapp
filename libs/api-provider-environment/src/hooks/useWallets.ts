import { ManagedWallet } from '@tangle-network/dapp-config/wallets';
import { useEffect, useState } from 'react';
import { useWebContext } from '../webb-context';

export const useWallets = () => {
  const [wallets, setWallets] = useState<ManagedWallet[]>([]);

  const {
    activeApi,
    activeChain,
    activeWallet,
    apiConfig,
    appName,
    inactivateApi,
  } = useWebContext();

  useEffect(
    () => {
      let isSubscribed = true;

      const configureSelectedWallets = async () => {
        const walletIds = Object.values(activeChain?.wallets ?? {});
        const walletsFromActiveChain = walletIds.map(
          (walletId) => apiConfig.wallets[walletId],
        );

        const wallets = await Promise.all(
          walletsFromActiveChain.map(
            async ({ detect, ...walletConfig }): Promise<ManagedWallet> => {
              const isDetected = Boolean(await detect(appName));
              const connected =
                activeWallet?.id === walletConfig.id && !!activeApi;

              if (connected) {
                return {
                  ...walletConfig,
                  detect,
                  enabled: isDetected,
                  connected,
                  endSession: async () => {
                    if (activeApi && activeApi.endSession) {
                      await Promise.all([
                        activeApi.endSession(),
                        await inactivateApi(),
                      ]);
                    }
                  },
                  canEndSession: true,
                };
              }

              return {
                ...walletConfig,
                detect,
                enabled: isDetected,
                connected,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                async endSession() {},
                canEndSession: false,
              };
            },
          ),
        );

        if (isSubscribed) {
          setWallets(wallets);
        }
      };
      configureSelectedWallets();

      return () => {
        isSubscribed = false;
      };
    },
    // prettier-ignore
    [activeChain, activeWallet, activeApi, inactivateApi, apiConfig.wallets, appName],
  );

  return {
    wallets,
    setWallets,
  };
};
