import { zodResolver } from '@hookform/resolvers/zod';
import { TabsContent } from '@radix-ui/react-tabs';
import { Alert } from '@webb-tools/webb-ui-components/components/Alert';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Form } from '@webb-tools/webb-ui-components/components/form';
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal';
import {
  TabsListWithAnimation,
  TabsRoot,
  TabsTriggerWithAnimation,
} from '@webb-tools/webb-ui-components/components/Tabs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { OPERATOR_PRICING_URL } from '../../../constants/links';
import GlobalPricingFields from './GlobalPricingFields';
import { globalFormSchema, GlobalFormSchema, PricingType } from './types';
import FormActions from './FormActions';

export default function PricingModal() {
  const [pricingType, setPricingType] = useState<PricingType>(
    PricingType.GLOBAL,
  );

  const form = useForm<GlobalFormSchema>({
    resolver: zodResolver(globalFormSchema),
    defaultValues: {
      cpuPrice: '',
      memPrice: '',
      hddStoragePrice: '',
      ssdStoragePrice: '',
      nvmeStoragePrice: '',
    },
  });

  function onSubmit(values: GlobalFormSchema) {
    console.log(values);
  }

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title="Configure Pricing"
      description="Configure the pricing for your blueprint(s)"
    >
      <ModalHeader className="pb-4">Configure Pricing</ModalHeader>

      <ModalBody className="p-0">
        <TabsRoot
          className="pt-4 px-9"
          value={pricingType}
          onValueChange={(type: string) => setPricingType(type as PricingType)}
        >
          <TabsListWithAnimation className="dark:bg-mono-200 max-w-[408px] mb-6">
            <TabsTriggerWithAnimation
              hideSeparator
              value={PricingType.GLOBAL}
              isActive={pricingType === PricingType.GLOBAL}
            >
              Global Pricing
            </TabsTriggerWithAnimation>

            <TabsTriggerWithAnimation
              hideSeparator
              value={PricingType.INDIVIDUAL}
              isActive={pricingType === PricingType.INDIVIDUAL}
            >
              Individual Pricing
            </TabsTriggerWithAnimation>
          </TabsListWithAnimation>

          <TabsContent value={PricingType.GLOBAL}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                <GlobalPricingFields formControl={form.control} />

                <Alert
                  type="info"
                  title="Once you set your pricing, it will automatically apply across every Blueprint you register for. Note that pricing updates will only affect future deployments, not currently active instances."
                />

                <FormActions />
              </form>
            </Form>
          </TabsContent>

          <TabsContent value={PricingType.INDIVIDUAL}>
            <div>Individual Pricing</div>
          </TabsContent>
        </TabsRoot>
      </ModalBody>
    </ModalContent>
  );
}
