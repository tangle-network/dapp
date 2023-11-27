import { useQueryParam, type QueryParamConfig } from 'use-query-params';

const QueryParamConfig = {
  encode: (value) => value,
  decode: (value) => {
    if (value == null) {
      return '';
    }

    return String(value);
  },
} satisfies QueryParamConfig<string>;

const useStateWithRoute = (key: string) => {
  return useQueryParam(key, QueryParamConfig);
};

export default useStateWithRoute;
