import { useQueryParam, type QueryParamConfig } from 'use-query-params';
import objectToSearchString from '../utils/objectToSearchString';

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
  return useQueryParam(key, QueryParamConfig, { objectToSearchString });
};

export default useStateWithRoute;
