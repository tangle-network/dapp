import { TANGLE_DAPP_URL } from '@tangle-network/ui-components/constants';

export enum PagePath {
  HOME = '/',

  INSTANCES = '/instances',

  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',

  OPERATORS = '/operators',
}

export enum TangleDAppPagePath {
  RESTAKE_OPERATOR = `${TANGLE_DAPP_URL}restake/operators`,
  RESTAKE_DEPOSIT = `${TANGLE_DAPP_URL}restake?vault={{vault}}`,
}
