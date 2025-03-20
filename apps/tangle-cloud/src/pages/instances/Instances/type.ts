import {
  InstanceStatus,
  MonitoringBlueprint,
} from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';

export interface InstancesTabProps {
  isLoading: boolean;
  error: Error | null;
}

export interface RunningInstanceTabProps extends InstancesTabProps {
  data: MonitoringBlueprint['services'];
}

export type StoppedInstanceTabProps = RunningInstanceTabProps;

export interface InstancesTabsProps {
  runningInstances: RunningInstanceTabProps;
  stoppedInstances: StoppedInstanceTabProps;
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
