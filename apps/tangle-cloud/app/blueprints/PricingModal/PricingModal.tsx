import { zodResolver } from '@hookform/resolvers/zod';
import { TabsContent } from '@radix-ui/react-tabs';
import { Blueprint } from '@webb-tools/tangle-shared-ui/types/blueprint';
import { Alert } from '@webb-tools/webb-ui-components/components/Alert';
import { Form } from '@webb-tools/webb-ui-components/components/form';
import {
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal';
import {
  TabsListWithAnimation,
  TabsRoot,
  TabsTriggerWithAnimation,
} from '@webb-tools/webb-ui-components/components/Tabs';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormActions from './FormActions';
import GlobalPricingFields from './GlobalPricingFields';
import IndividualPricingField from './IndividualPricingField';
import {
  globalFormSchema,
  GlobalFormSchema,
  individualFormSchema,
  IndividualFormSchema,
  PricingFormResult,
  PricingType,
} from './types';

type Props = {
  blueprints: Blueprint[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: PricingFormResult) => void;
};

export default function PricingModal({
  blueprints,
  onOpenChange,
  onSubmit,
}: Props) {
  const [pricingType, setPricingType] = useState<PricingType>(
    PricingType.GLOBAL,
  );

  const globalPricingForm = useForm<GlobalFormSchema>({
    resolver: zodResolver(globalFormSchema),
    defaultValues: {
      cpuPrice: '',
      memPrice: '',
      hddStoragePrice: '',
      ssdStoragePrice: '',
      nvmeStoragePrice: '',
    },
  });

  const individualPricingFormSchema = useForm<IndividualFormSchema>({
    resolver: zodResolver(individualFormSchema),
    defaultValues: blueprints.reduce((acc, current) => {
      acc[current.id] = {
        cpuPrice: '',
        memPrice: '',
        hddStoragePrice: '',
        ssdStoragePrice: '',
        nvmeStoragePrice: '',
      };

      return acc;
    }, {} as IndividualFormSchema),
  });

  const handleClose = useCallback(() => {
    onOpenChange(false);
    globalPricingForm.reset();
    individualPricingFormSchema.reset();
  }, [globalPricingForm, individualPricingFormSchema, onOpenChange]);

  const onGlobalPricingFormSubmit = useCallback(
    (values: GlobalFormSchema) => {
      handleClose();
      onSubmit({
        type: PricingType.GLOBAL,
        values,
      });
    },
    [handleClose, onSubmit],
  );

  const onIndividualFormSubmit = useCallback(
    (values: IndividualFormSchema) => {
      handleClose();
      onSubmit({
        type: PricingType.INDIVIDUAL,
        values,
      });
    },
    [handleClose, onSubmit],
  );

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title="Configure Pricing"
      description="Configure the pricing for your blueprint(s)"
    >
      <ModalHeader onClose={handleClose} className="pb-4">
        Configure Pricing
      </ModalHeader>

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
            <Form {...globalPricingForm}>
              <form
                onSubmit={globalPricingForm.handleSubmit(
                  onGlobalPricingFormSubmit,
                )}
                className="space-y-3 sm:space-y-4"
              >
                <GlobalPricingFields formControl={globalPricingForm.control} />

                <Alert
                  type="info"
                  title="Once you set your pricing, it will automatically apply across every Blueprint you register for. Note that pricing updates will only affect future deployments, not currently active instances."
                />

                <FormActions />
              </form>
            </Form>
          </TabsContent>

          <TabsContent value={PricingType.INDIVIDUAL}>
            <Form {...individualPricingFormSchema}>
              <form
                onSubmit={individualPricingFormSchema.handleSubmit(
                  onIndividualFormSubmit,
                )}
                className="space-y-6"
              >
                <IndividualPricingField
                  blueprints={blueprints}
                  formControl={individualPricingFormSchema.control}
                  watch={individualPricingFormSchema.watch}
                />

                <FormActions />
              </form>
            </Form>
          </TabsContent>
        </TabsRoot>
      </ModalBody>
    </ModalContent>
  );
}
