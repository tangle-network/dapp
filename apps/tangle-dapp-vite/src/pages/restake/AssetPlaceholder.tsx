import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import type { ComponentProps } from 'react';

import SelectorPlaceholder from './SelectorPlaceholder';

const AssetPlaceholder = ({
  children = 'Asset',
  Icon = <TokenIcon size="lg" className="mr-2" />,
  ...props
}: Partial<ComponentProps<typeof SelectorPlaceholder>>) => {
  return (
    <SelectorPlaceholder Icon={Icon} {...props}>
      {children}
    </SelectorPlaceholder>
  );
};

export default AssetPlaceholder;
