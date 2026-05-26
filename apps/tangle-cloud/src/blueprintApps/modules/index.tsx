import type { ReactNode } from 'react';
import type { BlueprintAppEntry } from '../types';

// Curated registry historically allowed a per-blueprint hand-rolled React
// module to override the procedural `BlueprintAppLandingPage` rendering.
// We've moved entirely off that path: customization now happens either
// (a) inside the publisher's hosted iframe app, or (b) via on-chain
// `blueprintUi` metadata (`overviewCards`, `actions`, `resourceViews`,
// `theme`) consumed by the procedural component.
//
// The dispatcher is preserved as a `null`-returning stub so existing call
// sites don't need to be deleted — they short-circuit to the procedural
// landing immediately. Re-adding a per-blueprint module is intentionally
// painful; if a blueprint can't be expressed through metadata + iframe
// today, the right fix is to grow the metadata schema, not fork a React
// component.
export function renderCuratedBlueprintLanding(
  _entry: BlueprintAppEntry,
): ReactNode | null {
  return null;
}

export function renderCuratedBlueprintService(
  _entry: BlueprintAppEntry,
  _serviceId: string,
): ReactNode | null {
  return null;
}
