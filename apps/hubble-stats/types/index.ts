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
