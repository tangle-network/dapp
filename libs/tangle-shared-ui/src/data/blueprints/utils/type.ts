import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';
import toPrimitiveService from './toPrimitiveService';

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
  services: OperatorBlueprint['services'] & {
    earned?: string;
    uptime?: number;
    lastActive?: Date;
  };
}
