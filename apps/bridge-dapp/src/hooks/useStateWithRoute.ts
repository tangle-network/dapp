import { useQueryParam, type QueryParamConfig } from 'use-query-params';
import qs from 'query-string';

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
  return useQueryParam(key, QueryParamConfig, {
    objectToSearchString(encodedParams) {
      return qs.stringify(encodedParams, {
        skipEmptyString: true,
        skipNull: true,
      });
    },
  });
};

export default useStateWithRoute;
