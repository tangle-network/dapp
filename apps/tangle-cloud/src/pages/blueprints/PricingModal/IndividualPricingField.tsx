import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { FormField } from '@tangle-network/ui-components/components/form';
import type { Control } from 'react-hook-form';
import inputs from './inputs';
import InputsWrapper from './InputsWrapper';
import PriceField from './PriceField';
import type { IndividualFormSchema } from './types';
import { Typography } from '@tangle-network/ui-components';
import { Children } from 'react';

type Props = {
  blueprints: Blueprint[];
  formControl: Control<IndividualFormSchema>;
};

export default function IndividualPricingField({
  blueprints,
  formControl,
}: Props) {
  return (
    <div className="space-y-6">
      {Children.toArray(
        blueprints.map((blueprint, blueprintIdx) => (
          <div className="p-3 dark:bg-mono-170 rounded-xl">
            <div className="flex items-center gap-2">
              {blueprint.imgUrl && (
                <img
                  src={blueprint.imgUrl}
                  width={36}
                  height={36}
                  alt={blueprint.name}
                  className="flex-shrink-0 bg-center rounded-full"
                />
              )}
              <Typography variant="h4">{blueprint.name}</Typography>
            </div>

            <div className="p-0 mt-4">
              <InputsWrapper>
                {Children.toArray(
                  inputs.map((input, idx) => (
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
                            tabIndex={blueprintIdx * inputs.length + idx + 1}
                          />
                        );
                      }}
                    />
                  )),
                )}
              </InputsWrapper>
            </div>
          </div>
        )),
      )}
    </div>
  );
}
