import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';
import { map } from 'rxjs';

const useTotalIssuance = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.balances?.totalIssuance === undefined) {
        return null;
      }

      return apiRx.query.balances
        .totalIssuance()
        .pipe(map((issuance) => issuance.toBn()));
    }, []),
  );
};

export default useTotalIssuance;
