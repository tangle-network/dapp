import { FC, useMemo } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { AssetConfigurationStep } from './AssetConfigurationStep';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';
import useServiceMinimumNativeSecurityRequirement from '@tangle-network/tangle-shared-ui/data/blueprints/useServicePalletConfig';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  const { result: minimumNativeSecurityRequirementResult } =
    useServiceMinimumNativeSecurityRequirement();

  const minimumNativeSecurityRequirement = useMemo(() => {
    return minimumNativeSecurityRequirementResult || 0;
  }, [minimumNativeSecurityRequirementResult]);

  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />
      <AssetConfigurationStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />
      <RequestArgsConfigurationStep {...props} />
      <PaymentStep {...props} />
    </>
  );
};
