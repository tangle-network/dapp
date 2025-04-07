import { DeployBlueprintSchema } from '../../../../../utils/validations/deployBlueprint';
import { FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { VaultToken } from '@tangle-network/tangle-shared-ui/types';

export type BaseDeployStepProps = {
  errors?: FieldErrors<DeployBlueprintSchema>;
  setValue: UseFormSetValue<DeployBlueprintSchema>;
  watch: UseFormWatch<DeployBlueprintSchema>;
  blueprint?: Blueprint;
};

export type BasicInformationStepProps = BaseDeployStepProps;

export type SelectOperatorsStepProps = BaseDeployStepProps;

export type AssetConfigurationStepProps = BaseDeployStepProps;

export type OperatorSelectionTable = {
  address: SubstrateAddress;
  identityName?: string;
  vaultTokensInUsd?: number;
  instanceCount?: number;
  uptime?: number;
  restakersCount?: number;
  vaultTokens?: VaultToken[];
  pricing?: number;
};

export const ApprovalModelLabel: Record<DeployBlueprintSchema['AssetConfiguration']['approvalModel'], string> = {
  Fixed: 'Require all operators to approve',
  Dynamic: 'Minimum required approvals',
} as const;
