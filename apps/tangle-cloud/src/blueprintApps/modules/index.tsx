import type { ReactNode } from 'react';
import type { BlueprintAppEntry } from '../types';
import SandboxBlueprintLandingPage from './sandbox/SandboxBlueprintLandingPage';
import SandboxBlueprintServicePage from './sandbox/SandboxBlueprintServicePage';

export function renderCuratedBlueprintLanding(
  entry: BlueprintAppEntry,
): ReactNode | null {
  if (entry.module?.status !== 'active') {
    return null;
  }

  switch (entry.module.moduleId) {
    case 'sandbox':
      return <SandboxBlueprintLandingPage entry={entry} />;
    default:
      return null;
  }
}

export function renderCuratedBlueprintService(
  entry: BlueprintAppEntry,
  serviceId: string,
): ReactNode | null {
  if (entry.module?.status !== 'active') {
    return null;
  }

  switch (entry.module.moduleId) {
    case 'sandbox':
      return (
        <SandboxBlueprintServicePage entry={entry} serviceId={serviceId} />
      );
    default:
      return null;
  }
}
