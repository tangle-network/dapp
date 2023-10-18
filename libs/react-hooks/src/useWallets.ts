import { ManagedWallet } from '@webb-tools/dapp-config/wallets';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useEffect, useState } from 'react';

/**
 * @name useWallets
 */
export const useWallets = () => {
  const [wallets, setWallets] = useState<ManagedWallet[]>([]);

  const { activeApi, activeChain, activeWallet, apiConfig, inactivateApi } =
    useWebContext();

  useEffect(() => {
    let isSubscribed = true;

    const configureSelectedWallets = async () => {
      const walletIds = Object.values(activeChain?.wallets ?? {});
      const walletsFromActiveChain = walletIds.map(
        (walletId) => apiConfig.wallets[walletId]
      );

      const wallets = await Promise.all(
        walletsFromActiveChain.map(
          async ({ detect, ...walletConfig }): Promise<ManagedWallet> => {
            const isDetected = Boolean(await detect()) ?? false;
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
                canEndSession: Boolean(activeApi?.capabilities?.hasSessions),
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
          }
        )
      );

      if (isSubscribed) {
        setWallets(wallets);
      }
    };
    configureSelectedWallets();

    return () => {
      isSubscribed = false;
    };
  }, [activeChain, activeWallet, activeApi, inactivateApi, apiConfig.wallets]);

  return {
    wallets,
    setWallets,
  };
};
