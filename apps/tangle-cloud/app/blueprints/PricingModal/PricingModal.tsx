import { TabsContent } from '@radix-ui/react-tabs';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
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
import { OPERATOR_PRICING_URL } from '../../../constants/links';

enum PricingType {
  GLOBAL = 'global',
  INDIVIDUAL = 'individual',
}

export default function PricingModal() {
  const [pricingType, setPricingType] = useState<PricingType>(
    PricingType.GLOBAL,
  );

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title="Configure Pricing"
      description="Configure the pricing for your blueprint(s)"
    >
      <ModalHeader>Configure Pricing</ModalHeader>

      <ModalBody className="py-4 pb-0">
        <TabsRoot
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
            <div>Global Pricing</div>
          </TabsContent>

          <TabsContent value={PricingType.INDIVIDUAL}>
            <div>Individual Pricing</div>
          </TabsContent>
        </TabsRoot>

        <ModalFooter className="px-0">
          <Button
            href={OPERATOR_PRICING_URL}
            target="_blank"
            className="flex-1 max-w-none"
            variant="secondary"
          >
            Learn More
          </Button>

          <Button className="flex-1 max-w-none">Save</Button>
        </ModalFooter>
      </ModalBody>
    </ModalContent>
  );
}
