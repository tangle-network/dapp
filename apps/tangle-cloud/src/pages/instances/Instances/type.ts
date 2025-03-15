import {
  InstanceStatus,
  MonitoringBlueprint,
} from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';

export interface InstancesTabProps {
  data: MonitoringBlueprint['services'];
  isLoading: boolean;
  error: Error | null;
}

export type RunningInstanceTabProps = InstancesTabProps;

export interface PendingInstanceTabProps extends InstancesTabProps {
  isOperator?: boolean;
  operatorIdentityMap?: Map<string, IdentityType | null>;
}

export type StoppedInstanceTabProps = InstancesTabProps;

export interface InstancesTabsProps {
  runningInstances: RunningInstanceTabProps;
  pendingInstances: PendingInstanceTabProps;
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
