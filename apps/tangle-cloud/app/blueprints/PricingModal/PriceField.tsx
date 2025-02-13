import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@tangle-network/webb-ui-components/components/form';
import { TextField } from '@tangle-network/webb-ui-components/components/TextField';
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

type PriceFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  label: string;
  description: string;
  placeholder?: string;
};

const PriceField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  label,
  description,
  placeholder = '0.00',
}: PriceFieldProps<TFieldValues, TName>) => {
  return (
    <FormItem className="space-y-1">
      <FormLabel>{label}</FormLabel>
      <FormDescription>{description}</FormDescription>
      <FormControl>
        <TextField.Root className="dark:bg-mono-200 dark:hover:bg-mono-190">
          <TextField.Input
            type="number"
            inputMode="decimal"
            placeholder={placeholder}
            {...field}
            value={field.value ?? ''}
            isDisabled={field.disabled}
          />
        </TextField.Root>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default PriceField;
