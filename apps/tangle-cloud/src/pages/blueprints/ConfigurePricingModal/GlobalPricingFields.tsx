import { FormField } from '@tangle-network/ui-components/components/form';
import type { Control } from 'react-hook-form';
import inputs from './inputs';
import InputsWrapper from './InputsWrapper';
import PriceField from './PriceField';
import type { GlobalFormSchema } from './types';

type Props = {
  formControl: Control<GlobalFormSchema>;
};

export default function GlobalPricingFields({ formControl }: Props) {
  return (
    <InputsWrapper>
      {inputs.map((input, idx) => (
        <FormField
          key={input.name}
          control={formControl}
          name={input.name}
          render={({ field }) => (
            <PriceField
              field={field}
              label={input.label}
              description={input.description}
              placeholder={input.placeholder}
              tabIndex={idx + 1}
            />
          )}
        />
      ))}
    </InputsWrapper>
  );
}
