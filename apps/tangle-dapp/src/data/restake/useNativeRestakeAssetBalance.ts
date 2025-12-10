/**
 * Hook to get native asset balance for restaking.
 * Returns null as native restaking via staking is deprecated in v2.
 */
const useNativeRestakeAssetBalance = (): bigint | null => {
  // Native restaking via Substrate staking is deprecated in v2
  // EVM users should use ERC20 token deposits instead
  return null;
};

export default useNativeRestakeAssetBalance;
