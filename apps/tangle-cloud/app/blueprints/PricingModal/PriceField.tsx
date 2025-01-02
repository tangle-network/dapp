import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@webb-tools/webb-ui-components/components/form';
import { TextField } from '@webb-tools/webb-ui-components/components/TextField';
import type { ControllerRenderProps } from 'react-hook-form';
import type { PriceFieldSchema } from './types';

type PriceFieldProps = {
  field: ControllerRenderProps<PriceFieldSchema, keyof PriceFieldSchema>;
  label: string;
  description: string;
  placeholder?: string;
};

const PriceField = ({
  field,
  label,
  description,
  placeholder = '0.00',
}: PriceFieldProps) => {
  return (
    <FormItem className="space-y-1">
      <FormLabel>{label}</FormLabel>
      <FormDescription>{description}</FormDescription>
      <FormControl>
        <TextField.Root className="dark:bg-mono-200">
          <TextField.Input
            type="number"
            inputMode="decimal"
            placeholder={placeholder}
            {...field}
            isDisabled={field.disabled}
          />
        </TextField.Root>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default PriceField;
