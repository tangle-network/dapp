import type { BlueprintMonitoringItem } from '../RegisteredBlueprints/type';

export interface InstanceMonitoringItem {
  id: string;
  blueprintId: string;
  blueprint: BlueprintMonitoringItem;
  instance: Instance;
}

export interface Instance {
  id: string;
  instanceId: string;
  earned: number;
  earnedInUsd: number;
  uptime: number;
  lastActive: string;
  imgUrl: string;
  status: EInstanceStatus;
}

export enum EInstanceStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  PENDING = 'Pending',
}
