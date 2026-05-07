'use client';

import { lazy, Suspense } from 'react';
import type { IdentityProps } from '@polkadot/react-identicon/types';

// Heavy dependency: `@polkadot/react-identicon` pulls `@polkadot/util`,
// `@polkadot/util-crypto`, and `@polkadot/keyring` (~117KB combined).
// Lazy-load it so that the polkadot vendor chunk is only fetched when an
// `Identicon` actually mounts — pages that don't render an avatar (or
// render it under a Suspense / data-loading gate) never pay the cost.
//
// `import type { IdentityProps } ...` above is erased at build time, so the
// type-only import here does NOT contribute to the eager bundle.
const PolkadotIdenticon = lazy(() => import('@polkadot/react-identicon'));

export const Identicon = (props: IdentityProps) => {
  // Render an empty placeholder while the chunk is in flight. The `Avatar`
  // wrapper already provides sizing/border styling, so the user sees a
  // circular avatar outline that fills in once the identicon resolves.
  return (
    <Suspense fallback={null}>
      <PolkadotIdenticon {...props} />
    </Suspense>
  );
};
