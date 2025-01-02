import { FormField } from '@webb-tools/webb-ui-components/components/form';
import type { Control } from 'react-hook-form';
import PriceField from './PriceField';
import type { GlobalFormSchema } from './types';

type Props = {
  formControl: Control<GlobalFormSchema>;
};

export default function GlobalPricingFields({ formControl }: Props) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-4 sm:gap-x-6">
      <FormField
        control={formControl}
        name="cpuPrice"
        render={({ field }) => (
          <PriceField
            field={field}
            label="CPU Price"
            description="Price per CPU core per hour"
            placeholder="0.00"
          />
        )}
      />

      <FormField
        control={formControl}
        name="memPrice"
        render={({ field }) => (
          <PriceField
            field={field}
            label="Memory Price"
            description="Price per MB of memory per hour"
            placeholder="0.00"
          />
        )}
      />

      <FormField
        control={formControl}
        name="hddStoragePrice"
        render={({ field }) => (
          <PriceField
            field={field}
            label="HDD Storage Price"
            description="Price per GB of HDD storage per hour"
            placeholder="0.00"
          />
        )}
      />

      <FormField
        control={formControl}
        name="ssdStoragePrice"
        render={({ field }) => (
          <PriceField
            field={field}
            label="SSD Storage Price"
            description="Price per GB of SSD storage per hour"
            placeholder="0.00"
          />
        )}
      />

      <FormField
        control={formControl}
        name="nvmeStoragePrice"
        render={({ field }) => (
          <PriceField
            field={field}
            label="NVMe Storage Price"
            description="Price per GB of NVMe storage per hour"
            placeholder="0.00"
          />
        )}
      />
    </div>
  );
}
