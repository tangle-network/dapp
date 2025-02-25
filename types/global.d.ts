import type { InjectedWindowProvider } from '@polkadot/extension-inject/types';

/**
 * SVG files can be imported as React components
 * @see https://react-svgr.com/docs/next/#typescript
 */
declare module '*.svg' {
  import { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGElement>>;
  export default content;
}

declare module '*.svg?url' {
  const content: any;
  export default content;
}

declare global {
  interface Window {
    injectedWeb3?: Record<string, InjectedWindowProvider>;
  }
}
