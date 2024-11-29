import { PagePath } from '../types';

export default function getViewOperatorLink(address: string) {
  return `${PagePath.RESTAKE_OPERATOR}/${address}`;
}
