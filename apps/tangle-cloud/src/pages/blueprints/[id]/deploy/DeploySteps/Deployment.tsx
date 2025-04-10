import { FC } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { AssetConfigurationStep } from './AssetConfigurationStep';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep {...props} />
      <AssetConfigurationStep {...props} />
      <RequestArgsConfigurationStep {...props} />
      <PaymentStep {...props} />
    </>
  );
};
