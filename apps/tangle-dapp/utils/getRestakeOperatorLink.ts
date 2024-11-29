import { PagePath, QueryParamKey } from '../types';

export default function getRestakeOperatorLink(address: string) {
  return `${PagePath.RESTAKE_STAKE}?${QueryParamKey.RESTAKE_OPERATOR}=${address}`;
}
