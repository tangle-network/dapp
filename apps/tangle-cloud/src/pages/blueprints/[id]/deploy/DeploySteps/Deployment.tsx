import { FC } from 'react';
import { BasicInformationStep } from './BasicInformationStep';
import { BaseDeployStepProps } from './type';
import { SelectOperatorsStep } from './OperatorSelectionStep';
import { RequestArgsConfigurationStep } from './RequestArgsConfigurationStep';
import { PaymentStep } from './PaymentStep';
import { RequestModeStep } from './RequestModeStep';
import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
  Typography,
} from '@tangle-network/ui-components';

export const Deployment: FC<BaseDeployStepProps> = (props) => {
  const minimumNativeSecurityRequirement = 0;
  const expectedRequestArgsCount =
    props.requestSchemaFieldCount ?? props.blueprint?.requestParams?.length ?? 0;
  const shouldShowAdvancedSummary =
    expectedRequestArgsCount > 0 || props.hasRequestSchema === false;

  return (
    <>
      <BasicInformationStep {...props} />
      <SelectOperatorsStep
        {...props}
        minimumNativeSecurityRequirement={minimumNativeSecurityRequirement}
      />

      <div className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03]">
        <Accordion type="single" collapsible defaultValue={undefined}>
          <AccordionItem value="advanced-config" className="p-0">
            <AccordionButton className="px-6 py-4">
              Advanced configuration
            </AccordionButton>
            <AccordionContent className="space-y-4 px-6 pb-6 pt-0">
              <div className="space-y-1">
                <Typography variant="body2" className="text-mono-100">
                  Most services only need a name, operators, and a caller. Open
                  this section when you need custom request args, security
                  commitments, or a non-default payment setup.
                </Typography>
                {shouldShowAdvancedSummary && (
                  <Typography variant="body3" className="text-mono-80">
                    {expectedRequestArgsCount > 0
                      ? `This blueprint expects ${expectedRequestArgsCount} request argument${expectedRequestArgsCount === 1 ? '' : 's'}.`
                      : 'This blueprint has no request arguments, but its request schema could not be resolved.'}
                  </Typography>
                )}
              </div>

              <RequestModeStep {...props} />
              <RequestArgsConfigurationStep {...props} />
              <PaymentStep {...props} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};
