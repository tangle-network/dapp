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
    pricing?: number;
    pricingUnit?: string;
    instanceCount?: number;
    operatorsCount?: number;
    tvl?: number;
  };
  services: Array<
    OperatorBlueprint['services'][number] & {
      earned?: number;
      uptime?: number;
      lastActive?: Date;
      instanceId?: string;
      earnedInUsd?: number;
      imgUrl?: string;
      status?: InstanceStatus;
      blueprintData?: MonitoringBlueprint['blueprint'];
      createdAtBlock?: number;
    }
  >;
}
