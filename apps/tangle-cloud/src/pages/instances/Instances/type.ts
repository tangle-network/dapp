import {
  InstanceStatus,
  MonitoringBlueprint,
  MonitoringServiceRequest,
} from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

export interface InstancesTabProps {
  isLoading: boolean;
  error: Error | null;
}

export interface RunningInstanceTabProps extends InstancesTabProps {
  data: MonitoringBlueprint['services'];
}

export interface PendingInstanceTabProps extends InstancesTabProps {
  data: MonitoringServiceRequest[];
  isOperator?: boolean;
  operatorIdentityMap?: Map<SubstrateAddress, IdentityType | null>;
}

export type StoppedInstanceTabProps = RunningInstanceTabProps;

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
