import type { InjectedProviderFlags, WindowProvider } from 'wagmi/window';

/*
 * Returns the explicit window provider that matches the flag and the flag is true
 */
export function getExplicitInjectedProvider(
  providers: WindowProvider[] | undefined,
  flag: keyof InjectedProviderFlags
): WindowProvider | undefined {
  if (typeof window === 'undefined' || typeof window.ethereum === 'undefined')
    return;
  return providers
    ? providers
        .filter((provider) => provider[flag])
        // if not targeting rainbow wallet, prevent rainbow wallet from being used
        .find(
          (provider: any) =>
            provider?.['rainbowIsDefaultProvider'] ===
            (flag === 'isRainbow' ? true : undefined)
        )
    : window.ethereum[flag]
    ? window.ethereum
    : undefined;
}
