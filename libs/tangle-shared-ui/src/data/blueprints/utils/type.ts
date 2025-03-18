import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';
import toPrimitiveService from './toPrimitiveService';

export enum InstanceStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  PENDING = 'Pending',
}

export interface OperatorBlueprint {
  blueprintId: number;
  blueprint: ReturnType<typeof toPrimitiveBlueprint>;
  services: Array<ReturnType<typeof toPrimitiveService>>;
}

export interface MonitoringBlueprint extends OperatorBlueprint {
  blueprint: OperatorBlueprint['blueprint'] & {
    uptime?: number;
    instanceCount?: number;
    operatorsCount?: number;
    tvl?: number;
  };
  services: Array<
    OperatorBlueprint['services'][number] & {
      earned?: number;
      uptime?: number;
      lastActive?: Date;
      externalInstanceId?: string;
      earnedInUsd?: number;
      blueprintData?: MonitoringBlueprint['blueprint'];
      createdAtBlock?: number;
      pendingOperators?: SubstrateAddress[];
      approvedOperators?: SubstrateAddress[];
    }
  >;
}

export interface ServiceInstance {
  instanceId: number;
  serviceInstance?: ReturnType<typeof toPrimitiveService>;
}
