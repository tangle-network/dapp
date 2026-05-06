'use client';

import PolkadotIdenticon from '@polkadot/react-identicon';
import { ComponentProps } from 'react';

export const Identicon = (props: ComponentProps<typeof PolkadotIdenticon>) => {
  return <PolkadotIdenticon {...props} />;
};
