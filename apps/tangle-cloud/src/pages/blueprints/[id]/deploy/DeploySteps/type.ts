import { DeployBlueprintSchema } from '../../../../../utils/validations/deployBlueprint';
import { FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';

export type DeployStep1Props = {
  errors?: FieldErrors<DeployBlueprintSchema>;
  setValue: UseFormSetValue<DeployBlueprintSchema>;
  watch: UseFormWatch<DeployBlueprintSchema>;
  blueprint?: Blueprint;
};
