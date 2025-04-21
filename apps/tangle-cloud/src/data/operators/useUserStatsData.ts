// TODO: Implement this
export const useUserStatsData = (accountAddress: string | null | undefined) => {
  return {
    result: {
      runningServices: 0,
      deployedServices: 0,
      pendingServices: 0,
      consumedServices: 0,
    }
  };
};
