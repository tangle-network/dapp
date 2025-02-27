export type BlueprintMonitoringItem = {
  id: string;
  name: string;
  author: string;
  imgUrl: string | null;
  description: string | null;
  restakersCount: number | null;
  operatorsCount: number | null;
  tvl: number | null;
  uptime: number | null;
  pricing: number | null;
  pricingUnit: string | null;
  instanceCount: number | null;
};
