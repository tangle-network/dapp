import {
  InstanceStatus,
  MonitoringBlueprint,
} from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';

export interface InstancesTabProps {
  data: MonitoringBlueprint['services'];
  isLoading: boolean;
  error: Error | null;
  isOperator?: boolean;
}

export interface InstancesTabsProps {
  runningInstances: InstancesTabProps;
  pendingInstances: InstancesTabProps;
  stoppedInstances: InstancesTabProps;
}

export interface Instance {
  id: string;
  instanceId: string;
  earned: number;
  earnedInUsd: number;
  uptime: number;
  lastActive: string;
  imgUrl: string;
  status: InstanceStatus;
}
