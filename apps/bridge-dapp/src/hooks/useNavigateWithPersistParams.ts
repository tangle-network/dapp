import { useCallback } from 'react';
import { NavigateOptions, To, useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import merge from 'lodash/merge';

/**
 * Custom the `useNaviagte` hook from `react-router` to persist the search params
 * @returns a navigate function that will persist the search params
 */
const useNavigateWithPersistParams = (): ReturnType<typeof useNavigate> => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  return useCallback(
    (toOrDelta: To | number, options?: NavigateOptions) => {
      if (typeof toOrDelta === 'number') {
        const path = pathname.split('/').slice(0, -1).join('/');
        const args =
          toOrDelta !== -1
            ? toOrDelta
            : ({
                search: searchParams.toString(),
                pathname: path,
              } satisfies To);

        typeof args === 'number' ? navigate(args) : navigate(args, options);
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
    [navigate, pathname, searchParams]
  );
};

export default useNavigateWithPersistParams;
