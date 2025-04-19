// TODO: Implement this
export const useUserStatsData = (accountAddress: string | null | undefined) => {
  if (!accountAddress) {
    return null;
  }

  return {
    totalServices: 0,
    deployedServices: 0,
    pendingServices: 0,
    consumedServices: 0,
  };
};
