import { TANGLE_DAPP_URL } from '@tangle-network/ui-components/constants';

export enum PagePath {
  HOME = '/',

  INSTANCES = '/instances',

  BLUEPRINTS = '/deploy',
  BLUEPRINTS_DETAILS = '/deploy/:id',

  OPERATORS = '/operators',
}

export enum TangleDAppPagePath {
  RESTAKE_OPERATOR = `${TANGLE_DAPP_URL}restake/operators`,
}
