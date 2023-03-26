import { RecipientInput } from '@webb-tools/webb-ui-components';
import React, { ComponentProps } from 'react';

const overrideInputProps: ComponentProps<
  typeof RecipientInput
>['overrideInputProps'] = {
  placeholder: '0x000000000000000000000000000000',
};

const RecipientAddressInput = () => {
  return (
    <div className="space-y-2">
      <RecipientInput
        className="max-w-none input-height"
        title="Address"
        overrideInputProps={overrideInputProps}
      />
    </div>
  );
};

export default RecipientAddressInput;
