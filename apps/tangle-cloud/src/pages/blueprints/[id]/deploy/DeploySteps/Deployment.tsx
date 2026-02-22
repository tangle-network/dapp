import { FC } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { AssetConfigurationStep } from './AssetConfigurationStep';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';
import { RequestModeStep } from './RequestModeStep';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  // In EVM mode, the minimum security requirement is handled differently
  // through security commitments in the AssetConfigurationStep
  const minimumNativeSecurityRequirement = 0;

  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />
      <RequestModeStep {...props} />
      <AssetConfigurationStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />
      <RequestArgsConfigurationStep {...props} />
      <PaymentStep {...props} />
    </>
  );
};
