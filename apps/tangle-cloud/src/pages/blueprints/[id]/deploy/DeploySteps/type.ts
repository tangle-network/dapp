import { DeployBlueprintSchema } from "../../../../../utils/validations/deployBlueprint";
import { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";

export type DeployStep1Props = {
  errors?: FieldErrors<DeployBlueprintSchema>;
  setValue: UseFormSetValue<DeployBlueprintSchema>;
  watch: UseFormWatch<DeployBlueprintSchema>;
};
