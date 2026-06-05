import { FC } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';
import { RequestModeStep } from './RequestModeStep';
import { Text } from '../../../../../components/sandbox/SandboxUi';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  const minimumNativeSecurityRequirement = 0;
  const expectedRequestArgsCount =
    props.requestSchemaFieldCount ??
    props.blueprint?.requestParams?.length ??
    0;
  const shouldShowAdvancedSummary =
    expectedRequestArgsCount > 0 || props.hasRequestSchema === false;

  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />
      <PaymentStep {...props} />

      <div className="border border-border bg-card/70">
        <details>
          <summary className="cursor-pointer px-6 py-4 font-medium text-foreground">
            Advanced
          </summary>
          <div className="space-y-4 px-6 pb-6 pt-0">
            <div className="space-y-1">
              <Text variant="body2" className="text-muted-foreground">
                Most services only need a name, operators, and a caller. Open
                this section when you need custom request args, security
                commitments, or a non-default payment setup.
              </Text>
              {shouldShowAdvancedSummary && (
                <Text variant="body3" className="text-muted-foreground">
                  {expectedRequestArgsCount > 0
                    ? `This blueprint expects ${expectedRequestArgsCount} request argument${expectedRequestArgsCount === 1 ? '' : 's'}.`
                    : 'This blueprint has no request arguments, but its request schema could not be resolved.'}
                </Text>
              )}
            </div>

            <RequestModeStep {...props} />
            <RequestArgsConfigurationStep {...props} />
          </div>
        </details>
      </div>
    </>
  );
};
