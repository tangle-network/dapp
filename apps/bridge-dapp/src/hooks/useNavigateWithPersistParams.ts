import { useCallback } from 'react';
import { NavigateOptions, To, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import merge from 'lodash/merge';

const useNavigateWithPersistParams = (): ReturnType<typeof useNavigate> => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return useCallback(
    (toOrDelta: To | number, options?: NavigateOptions) => {
      if (typeof toOrDelta === 'number') {
        navigate(toOrDelta);
      } else if (typeof toOrDelta === 'string') {
        navigate(
          { search: searchParams.toString(), pathname: toOrDelta },
          options
        );
      } else {
        navigate(
          merge({ search: searchParams.toString() }, toOrDelta),
          options
        );
      }
    },
    [navigate, searchParams]
  );
};

export default useNavigateWithPersistParams;
