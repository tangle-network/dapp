import qs from 'query-string';
import { type EncodedQuery } from 'use-query-params';

const objectToSearchString = (encodedParams: EncodedQuery) => {
  return qs.stringify(encodedParams, {
    skipEmptyString: true,
    skipNull: true,
  });
};

export default objectToSearchString;
