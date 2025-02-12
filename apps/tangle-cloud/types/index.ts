import { TANGLE_DAPP_URL } from '@webb-tools/webb-ui-components/constants';

export enum PagePath {
  HOME = '/',
  BLUEPRINTS = '/blueprints',
  OPERATORS = '/operators',
  MY_SERVICES = '/account',
}

export enum TangleDAppPagePath {
  RESTAKE_OPERATOR = `${TANGLE_DAPP_URL}restake/operators`,
}
