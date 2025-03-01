import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';

export interface BlueprintMonitoringItem extends Blueprint {
  uptime?: number;
  pricing?: number;
  pricingUnit?: string;
  instanceCount?: number;
  tvlInUsd?: number;
}
