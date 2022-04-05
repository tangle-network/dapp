import { useWebContext } from '@webb-dapp/react-environment';
import { ManagedWallet } from '@webb-tools/api-providers/types/wallet-config.interface';
import { useEffect, useState } from 'react';

/**
 * @name useWallets
 */
export const useWallets = () => {
  const [wallets, setWallets] = useState<ManagedWallet[]>([]);

  const { activeApi, activeChain, activeWallet, inactivateApi } = useWebContext();
  useEffect(() => {
    const configureSelectedWallets = async () => {
      const walletsFromActiveChain = Object.values(activeChain?.wallets ?? {});
      const wallets = await Promise.all(
        walletsFromActiveChain.map(async ({ detect, ...walletConfig }) => {
          const isDetected = (await detect?.()) ?? false;
          const connected = activeWallet?.id === walletConfig.id && activeApi;
          if (connected) {
            return {
              ...walletConfig,
              enabled: isDetected,
              connected,
              endSession: async () => {
                if (activeApi && activeApi.endSession) {
                  await Promise.all([activeApi.endSession(), await inactivateApi()]);
                }
              },
              canEndSession: Boolean(activeApi?.capabilities?.hasSessions),
            };
          }
          return {
            ...walletConfig,
            enabled: isDetected,
            connected,
            async endSession() {},
            canEndSession: false,
          };
        })
      );
      // @ts-ignore
      setWallets(wallets);
    };
    configureSelectedWallets();
  }, [activeChain, activeWallet, activeApi, inactivateApi]);

  return {
    wallets,
    setWallets,
  };
};
