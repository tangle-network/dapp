import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { TANGLE_DAPP_URL } from '@tangle-network/ui-components/constants';

export enum PagePath {
  HOME = '/',

  INSTANCES = '/instances',

  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',
  BLUEPRINTS_DEPLOY = '/blueprints/:id/deploy',
  BLUEPRINTS_REGISTRATION_REVIEW = '/registration-review',

  OPERATORS = '/operators',
}

export enum TangleDAppPagePath {
  RESTAKE_OPERATOR = `${TANGLE_DAPP_URL}restake/operators`,
  RESTAKE_DEPOSIT = `${TANGLE_DAPP_URL}restake?vault={{vault}}`,
}

export type ApprovalConfirmationFormFields = {
  requestId: number;
  securityCommitment: SecurityCommitment[];
};

export type SecurityCommitment = {
  assetId: RestakeAssetId;
  exposurePercent: string;
};

export type SecurityRequirement = {
  asset: RestakeAssetId;
  minExposurePercent: number;
  maxExposurePercent: number;
};

export type RegisterServiceFormFields = {
  blueprintIds: Array<number | string>;
  preferences: {
    key: Uint8Array; // 65 bytes
    priceTargets: {
      cpu: number;
      mem: number;
      storageHdd: number;
      storageSsd: number;
      storageNvme: number;
    };
  }[];
  registrationArgs:  ({
      Optional: any;
    } | {
        Bool: any;
    } | {
        Uint8: any;
    } | {
        Int8: any;
    } | {
        Uint16: any;
    } | {
        Int16: any;
    } | {
        Uint32: any;
    } | {
        Int32: any;
    } | {
        Uint64: any;
    } | {
        Int64: any;
    } | {
        String: any;
    } | {
        Array: any;
    } | {
        List: any;
    } | {
        Struct: any;
    } | {
        AccountId: any;
    })[][];
  amounts: number[];
};
