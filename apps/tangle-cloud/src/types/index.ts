import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { PrimitiveField } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TANGLE_DAPP_URL } from '@tangle-network/ui-components/constants';

export enum PagePath {
  HOME = '/',
  INSTANCES = '/instances',
  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',
  BLUEPRINTS_DEPLOY = '/blueprints/:id/deploy',
  BLUEPRINTS_REGISTRATION_REVIEW = '/registration-review',
  OPERATORS = '/operators',
  NOT_FOUND = '/404',
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
    rpcUrl?: string; // Optional RPC URL for the service
  }[];
  registrationArgs: Array<PrimitiveField[]>;
  amounts: number[];
};
