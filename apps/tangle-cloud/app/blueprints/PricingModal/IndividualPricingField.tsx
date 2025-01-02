import type { Blueprint } from '@webb-tools/tangle-shared-ui/types/blueprint';
import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
} from '@webb-tools/webb-ui-components/components/Accordion';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import { FormField } from '@webb-tools/webb-ui-components/components/form';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import Image from 'next/image';
import type { Control, UseFormWatch } from 'react-hook-form';
import inputs from './inputs';
import InputsWrapper from './InputsWrapper';
import PriceField from './PriceField';
import type { IndividualFormSchema, PriceFieldSchema } from './types';

type Props = {
  blueprints: Blueprint[];
  formControl: Control<IndividualFormSchema>;
  watch: UseFormWatch<IndividualFormSchema>;
};

const allInpusFilled = (inputValues?: Partial<PriceFieldSchema>) => {
  return (
    inputValues?.cpuPrice !== undefined &&
    inputValues?.memPrice !== undefined &&
    inputValues?.hddStoragePrice !== undefined &&
    inputValues?.ssdStoragePrice !== undefined &&
    inputValues?.nvmeStoragePrice !== undefined
  );
};

export default function IndividualPricingField({
  blueprints,
  formControl,
  watch,
}: Props) {
  const inputValues = watch();

  return (
    <Accordion
      type="single"
      defaultValue={blueprints.length > 0 ? blueprints[0].id : undefined}
      collapsible
    >
      <ScrollArea className="h-[417px]">
        <div className="space-y-6">
          {blueprints.map((blueprint) => (
            <AccordionItem
              className="p-3 dark:bg-mono-170 rounded-xl"
              key={blueprint.id}
              value={blueprint.id}
            >
              <AccordionButton
                className="p-0 min-h-[60px]"
                Icon={
                  blueprint.imgUrl && (
                    <Image
                      src={blueprint.imgUrl}
                      width={36}
                      height={36}
                      alt={blueprint.name}
                      className="flex-shrink-0 bg-center rounded-full"
                      fill={false}
                    />
                  )
                }
                RightIcon={
                  allInpusFilled(inputValues[blueprint.id]) ? (
                    <Chip color="green">Ready</Chip>
                  ) : null
                }
              >
                {blueprint.name}
              </AccordionButton>

              <AccordionContent className="p-0 mt-4">
                <InputsWrapper>
                  {inputs.map((input) => (
                    <FormField
                      key={input.name}
                      control={formControl}
                      name={`${blueprint.id}.${input.name}`}
                      render={({ field }) => {
                        return (
                          <PriceField
                            field={field}
                            label={input.label}
                            description={input.description}
                            placeholder={input.placeholder}
                          />
                        );
                      }}
                    />
                  ))}
                </InputsWrapper>
              </AccordionContent>
            </AccordionItem>
          ))}
        </div>
      </ScrollArea>
    </Accordion>
  );
}
