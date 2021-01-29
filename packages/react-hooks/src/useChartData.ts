import { useContext, useEffect, useMemo, useState } from 'react';
import { ChartDataContext } from '@webb-dapp/react-environment';
import { InfluxDB } from '@influxdata/influxdb-client';

export const useChartData = (): InfluxDB => {
  const influxDB = useContext(ChartDataContext);

  return influxDB;
};

export interface BasicChartData {
  value: number | string;
  time: string;
}

interface LoanOverviewHistory {
  collaterals: (BasicChartData & { asset: string })[];
  debits: (BasicChartData & { asset: string })[];
  loading: boolean;
}

export const useLoanOverviewChart = (): LoanOverviewHistory => {
  const influxDB = useChartData();
  const [loading, setLoading] = useState<boolean>(false);
  const [collaterals, setCollaterals] = useState<(BasicChartData & { asset: string })[]>([]);
  const [debits, setDebits] = useState<(BasicChartData & { asset: string })[]>([]);

  useEffect(() => {
    const query = influxDB.getQueryApi('acala');

    Promise.all([
      query.collectRows(`
        from(bucket: "acala-data")
          |> range(start: -7d, stop: now())
          |> filter(fn: (r) => 
            r["_measurement"]=="loan-overview" and
            r["_field"]=="collateral-value"
          )
          |> group(columns: ["asset"])
          |> aggregateWindow(every: 1d, fn: mean)
          |> drop(columns: ["_start", "_end"])
      `),
      query.collectRows(`
        from(bucket: "acala-data")
          |> range(start: -7d, stop: now())
          |> filter(fn: (r) => 
            r["_measurement"]=="loan-overview" and
            r["_field"]=="debitl-value"
          )
          |> group(columns: ["asset"])
          |> aggregateWindow(every: 1d, fn: mean)
          |> drop(columns: ["_start", "_end"])
      `),
    ]).then(([data1, data2]) => {
      setCollaterals(
        data1.map((item: any) => ({
          asset: item.asset,
          time: item._time,
          value: item._value,
        }))
      );
      setDebits(
        data2.map((item: any) => ({
          asset: item.asset,
          time: item._time,
          value: item._value,
        }))
      );
      setLoading(true);
    });
  }, [influxDB]);

  return useMemo(() => ({ collaterals, debits, loading }), [collaterals, debits, loading]);
};

interface OracleHistory {
  loading: boolean;
  data: Record<string, BasicChartData[]>;
}

export const useOracleHistoryChart = (currency: string): OracleHistory => {
  const influxDB = useChartData();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Record<string, BasicChartData[]>>({});

  useEffect(() => {
    if (!currency) return;

    const query = influxDB.getQueryApi('acala');

    setLoading(true);

    query
      .collectRows(
        `
      from(bucket: "acala-data")
        |> range(start: -7d, stop: now())
        |> filter(fn: (r) => 
          r["_measurement"]=="oracle" and
          r["asset"]=="${currency}"
        )
        |> group(columns: ["provider"])
        |> aggregateWindow(every: 5m, fn: mean)
        |> drop(columns: ["_start", "_stop"])
    `
      )
      .then((data) => {
        const result: Record<string, BasicChartData[]> = {};

        data.forEach((item: any) => {
          if (Reflect.has(result, item.provider)) {
            result[item.provider].push({
              time: item._time,
              value: item._value,
            });
          } else {
            result[item.provider] = [
              {
                time: item._time,
                value: item._value,
              },
            ];
          }
        });

        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [influxDB, currency]);

  return useMemo(() => ({ data, loading }), [data, loading]);
};
