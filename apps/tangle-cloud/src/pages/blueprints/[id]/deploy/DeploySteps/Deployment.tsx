import { FC } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';
import { RequestModeStep } from './RequestModeStep';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  const minimumNativeSecurityRequirement = 0;

  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />
      <RequestModeStep {...props} />
      <RequestArgsConfigurationStep {...props} />
      <PaymentStep {...props} />
    </>
  );
};
