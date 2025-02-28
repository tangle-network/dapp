import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';

export interface BlueprintMonitoringItem extends Blueprint {
  uptime: number | null;
  pricing: number | null;
  pricingUnit: string | null;
  instanceCount: number | null;
  tvlInUsd: number | null;
}
