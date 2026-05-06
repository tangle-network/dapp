import type { InjectedExtension } from '@polkadot/extension-inject/types';

/**
 * @deprecated Substrate wallet support has been removed. This hook returns null.
 * Substrate transactions will not work without a wallet injector.
 */
const useSubstrateInjectedExtension = (): InjectedExtension | null => {
  // Substrate wallet support has been removed - return null
  return null;
};

export default useSubstrateInjectedExtension;
