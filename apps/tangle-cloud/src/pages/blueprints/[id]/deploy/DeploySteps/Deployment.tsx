import { FC } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { AssetConfigurationStep } from './AssetConfigurationStep';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequetArgsConfigurationStep } from './RequetArgsConfigurationStep';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  return (
    <>
      <BasicInformationStep {...props} />
      <AssetConfigurationStep {...props} />
      <RequetArgsConfigurationStep {...props} />
      <SelectOperatorsStep {...props} />
    </>
  );
};
