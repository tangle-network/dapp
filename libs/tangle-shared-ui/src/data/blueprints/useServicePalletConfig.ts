import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { useCallback } from 'react';
import { of } from 'rxjs';

const useServiceMinimumNativeSecurityRequirement = () => {
  const { result, ...rest } = useApiRx(
    useCallback((apiRx) => {
      if (
        apiRx.consts?.services?.minimumNativeSecurityRequirement === undefined
      )
        return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

      return of(
        apiRx.consts.services.minimumNativeSecurityRequirement.toNumber(),
      );
    }, []),
  );

  return {
    result: result ?? 0,
    ...rest,
  };
};

export default useServiceMinimumNativeSecurityRequirement;
