import useApi from '../../hooks/useApi';
import { useCallback } from 'react';

const useServiceMinimumNativeSecurityRequirement = () => {
  const { result, ...rest } = useApi(
    useCallback((api) => {
      return api.consts.services.minimumNativeSecurityRequirement.toNumber();
    }, []),
  );

  return {
    result: result ?? 0,
    ...rest,
  };
};

export default useServiceMinimumNativeSecurityRequirement;
