import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';

export type ApprovalConfirmationFormFields = {
  requestId: number;
  securityCommitment: {
    assetId: RestakeAssetId;
    exposurePercent: string;
  }[];
};
