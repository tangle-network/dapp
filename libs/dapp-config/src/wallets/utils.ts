import type { InjectedProviderFlags, WindowProvider } from 'wagmi/window';

/*
 * Returns the explicit window provider that matches the flag and the flag is true
 */
export function getExplicitInjectedProvider(
  flag: keyof InjectedProviderFlags
): WindowProvider | undefined {
  if (typeof window === 'undefined' || typeof window.ethereum === 'undefined')
    return;
  const providers = window.ethereum.providers;
  return providers
    ? providers
        .filter((provider) => provider[flag])
        // if not rainbow wallet, prevent rainbow wallet from being used as default
        .find(
          (provider: any) =>
            provider?.['rainbowIsDefaultProvider'] ===
            (flag === 'isRainbow' ? true : undefined)
        )
    : window.ethereum[flag]
    ? window.ethereum
    : undefined;
}

export function hasInjectedProvider(
  flag: keyof InjectedProviderFlags
): boolean {
  return Boolean(getExplicitInjectedProvider(flag));
}

/*
 * Returns an injected provider that favors the flag match, but falls back to window.ethereum
 */
export function getInjectedProvider(
  flag: keyof InjectedProviderFlags
): WindowProvider | undefined {
  if (typeof window === 'undefined' || typeof window.ethereum === 'undefined')
    return;
  const providers = window.ethereum.providers;
  const provider = getExplicitInjectedProvider(flag);
  if (provider) return provider;
  else if (typeof providers !== 'undefined' && providers.length > 0)
    return providers[0];
  else return window.ethereum;
}
