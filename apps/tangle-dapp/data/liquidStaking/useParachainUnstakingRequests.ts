import useApiRx from '../../hooks/useApiRx';

const useParachainUnstakingRequests = () => {
  // TODO: Implement this hook.
  const a = useApiRx((api) => {
    return api.query.slp.delegationsOccupied();
  });
};

export default useParachainUnstakingRequests;
