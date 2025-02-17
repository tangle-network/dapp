/**
 * A hook to determine whether the wagmi config has been hydrated
 * on the client side.
 * It is utilizing the zustand store to determine the hydration status.
 * @returns a boolean indicating whether the wagmi config has been hydrated.
 *
 * @see https://docs.pmnd.rs/zustand/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
 */
export default function useWagmiHydration(): boolean;
