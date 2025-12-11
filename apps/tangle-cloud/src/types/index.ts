import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { PrimitiveField } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TANGLE_DAPP_URL } from '@tangle-network/ui-components/constants';

export enum PagePath {
  HOME = '/',
  INSTANCES = '/instances',
  SERVICE_DETAILS = '/services/:id',
  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',
  BLUEPRINTS_DEPLOY = '/blueprints/:id/deploy',
  BLUEPRINTS_CREATE = '/blueprints/create',
  BLUEPRINTS_MANAGE = '/blueprints/manage',
  BLUEPRINTS_REGISTRATION_REVIEW = '/registration-review',
  OPERATORS = '/operators',
  OPERATORS_MANAGE = '/operators/manage',
  REWARDS = '/rewards',
  EARNINGS = '/earnings',
  NOT_FOUND = '/404',
}

export enum TangleDAppPagePath {
  RESTAKE_DEPOSIT = `${TANGLE_DAPP_URL}restake?vault={{vault}}`,
  RESTAKE_DELEGATE = `${TANGLE_DAPP_URL}restake/delegate`,
  RESTAKE_OPERATOR = `${TANGLE_DAPP_URL}restake/operators`,
}

export type ApprovalConfirmationFormFields = {
  requestId: number;
  restakingPercent?: number;
  securityCommitment?: SecurityCommitment[];
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
