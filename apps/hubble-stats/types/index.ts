import { ACTIVE_SUBGRAPH_MAP } from '../constants';

export type ChartDataRecord = { [epoch: string]: number };

/**
 * The epoch response from the vAnchor client.
 * TODO: Extract this type from the vAnchor client.
 */
export type EpochResponse = {
  [epoch: string]: bigint;
};

export type MetricType = {
  value?: number;
  changeRate?: number;
};

export type FormattedBasicChartDataType = {
  date: Date;
  value: number;
}[];

export type FormattedVolumeChartDataType = {
  date: Date;
  deposit: number;
  withdrawal: number;
}[];

export type SubgraphUrlType =
  (typeof ACTIVE_SUBGRAPH_MAP)[keyof typeof ACTIVE_SUBGRAPH_MAP];
