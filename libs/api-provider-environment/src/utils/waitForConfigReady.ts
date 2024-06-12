import type getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';

export default async function waitForConfigReady(
  config: ReturnType<typeof getWagmiConfig>,
) {
  return new Promise<void>((resolve) => {
    if (
      config.state.status === 'connected' ||
      config.state.status === 'disconnected'
    )
      return resolve();

    const unsub = config.subscribe(
      (state) => state.status,
      (status) => {
        if (status === 'connected' || status === 'disconnected') {
          resolve();
          unsub();
        }
      },
    );
  });
}
