import { DeployBlueprintSchema } from '../../../../../utils/validations/deployBlueprint';
import {
  FieldErrors,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { VaultToken } from '@tangle-network/tangle-shared-ui/types';

export const LabelClassName = 'text-mono-200 dark:text-mono-0 font-medium';

export type BaseDeployStepProps = {
  errors?: FieldErrors<DeployBlueprintSchema>;
  setValue: UseFormSetValue<DeployBlueprintSchema>;
  watch: UseFormWatch<DeployBlueprintSchema>;
  blueprint?: Blueprint;
  setError: UseFormSetError<DeployBlueprintSchema>;
};

export type BasicInformationStepProps = BaseDeployStepProps;

export type SelectOperatorsStepProps = BaseDeployStepProps & {
  minimumNativeSecurityRequirement: number;
};

export type AssetConfigurationStepProps = BaseDeployStepProps & {
  minimumNativeSecurityRequirement: number;
};

export type RequestArgsConfigurationStepProps = BaseDeployStepProps;

export type PaymentStepProps = BaseDeployStepProps;

export type OperatorSelectionTable = {
  address: SubstrateAddress;
  identityName?: string;
  vaultTokensInUsd?: number;
  instanceCount?: number;
  uptime?: number;
  restakersCount?: number;
  vaultTokens?: VaultToken[];
};

export const ApprovalModelLabel: Record<
  DeployBlueprintSchema['approvalModel'],
  string
> = {
  Fixed: 'Require all operators to approve',
  Dynamic: 'Minimum required approvals',
} as const;
