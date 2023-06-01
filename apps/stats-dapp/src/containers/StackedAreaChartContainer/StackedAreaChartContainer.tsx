import { useAllProposalsTimestamps } from '../../provider/hooks';
import { useStatsContext } from '../../provider/stats-provider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Surface,
  Symbols,
} from 'recharts';
import { Spinner } from '@webb-tools/icons';
import { Card, Chip, TitleWithInfo } from '@webb-tools/webb-ui-components';
import { WebbColorsType } from '@webb-tools/webb-ui-components/types';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from /* preval */ '../../../tailwind.config.js';
import { Config } from 'tailwindcss';
import { useMemo, useState } from 'react';
const fullConfig = resolveConfig(tailwindConfig as Config);
const webbColors = fullConfig.theme?.colors as unknown as WebbColorsType;

const allProposals = [
  {
    type: 'refreshVote',
    backgroundColor: '#85DC8E',
  },
  {
    type: 'proposerSetUpdateProposal',
    backgroundColor: '#9BC5FC',
  },
  {
    type: 'anchorCreateProposal',
    backgroundColor: '#EAB612',
  },
  {
    type: 'anchorUpdateProposal',
    backgroundColor: '#4B3AA4',
  },
  {
    type: 'tokenAddProposal',
    backgroundColor: '#A0370B',
  },
  {
    type: 'tokenRemoveProposal',
    backgroundColor: '#288E32',
  },
  {
    type: 'wrappingFeeUpdateProposal',
    backgroundColor: '#EF570D',
  },
  {
    type: 'resourceIdUpdateProposal',
    backgroundColor: '#624FBE',
  },
  {
    type: 'rescueTokensProposal',
    backgroundColor: '#B5A9F2',
  },
  {
    type: 'maxDepositLimitUpdateProposal',
    backgroundColor: '#D08770',
  },
  {
    type: 'minWithdrawalLimitUpdateProposal',
    backgroundColor: '#FFE07C',
  },
  {
    type: 'setVerifierProposal',
    backgroundColor: '#FFB18B',
  },
  {
    type: 'setTreasuryHandlerProposal',
    backgroundColor: '#01550A',
  },
  {
    type: 'feeRecipientUpdateProposal',
    backgroundColor: '#B48EAD',
  },
];

const timeRanges = ['2 Hr', '10 Hr', '1 Day'];

export const StackedAreaChartContainer = () => {
  const { isDarkMode } = useStatsContext();

  const [timeRange, setTimeRange] = useState('2 Hr');

  const { val: allProposalsTimestamps, isLoading } =
    useAllProposalsTimestamps();

  const countData: Record<
    string,
    {
      [key: string]: string;
    }
  > = {};

  const zeroData: { [key: string]: string } = {};

  for (const proposalType of allProposals) {
    zeroData[proposalType.type] = '0';
  }

  for (const proposalType of allProposals) {
    if (allProposalsTimestamps) {
      const proposals = allProposalsTimestamps[proposalType.type].nodes;
      for (const proposal of proposals) {
        const date = formatDateWithTime(proposal.block.timestamp);
        if (!countData[date]) {
          countData[date] = {
            ...zeroData,
            rawTimestamp: proposal.block.timestamp,
          };
        }
        countData[date][proposalType.type] = (
          +(countData[date][proposalType.type] || '0') + 1
        ).toString();
      }
    }
  }

  for (const date in countData) {
    let totalCount = 0;

    allProposals.forEach((proposal) => {
      const count = countData[date][proposal.type]
        ? parseInt(countData[date][proposal.type], 10)
        : 0;
      totalCount += count;
    });

    countData[date].totalCount = totalCount.toString();
  }

  const countDataSorted = Object.entries(countData);

  countDataSorted.sort(
    (a, b) =>
      new Date(a[1].rawTimestamp).getTime() -
      new Date(b[1].rawTimestamp).getTime()
  );

  const convertedData = countDataSorted.map(([date, counts]) => ({
    date,
    rawTimestamp: counts.rawTimestamp,
    ...allProposals.reduce((acc: { [key: string]: any }, type) => {
      if (counts[type.type]) {
        acc[type.type] = counts[type.type];
      }
      return acc;
    }, {}),
  }));

  const thirtyMinData = useMemo(() => {
    return filterDatesByMinutes(convertedData, 120);
  }, [convertedData]);

  const oneHourData = useMemo(() => {
    return filterDatesByMinutes(convertedData, 600);
  }, [convertedData]);

  const oneDayData = useMemo(() => {
    return filterDatesByMinutes(convertedData, 60 * 24);
  }, [convertedData]);

  const finalConvertedData = useMemo(() => {
    let filteredData;

    if (timeRange === '2 Hr') {
      filteredData = thirtyMinData;

      if (filteredData.length < 2) {
        filteredData = oneHourData;

        if (filteredData.length < 2) {
          filteredData = oneDayData;

          if (filteredData.length < 2) {
            filteredData = convertedData;
          }
        }
      }
    } else if (timeRange === '10 Hr') {
      filteredData = oneHourData;

      if (filteredData.length < 2) {
        filteredData = oneDayData;

        if (filteredData.length < 2) {
          filteredData = convertedData;
        }
      }
    } else if (timeRange === '1 Day') {
      filteredData = oneDayData;

      if (filteredData.length < 2) {
        filteredData = convertedData;
      }
    }

    return filteredData;
  }, [timeRange, convertedData, thirtyMinData, oneHourData, oneDayData]);

  useEffect(() => {
    setTimeRange('three-months');
  }, []);

  return (
    <Card>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between pr-14 pt-2">
            <TitleWithInfo
              title="Proposal (Submission) History"
              variant="h5"
              info="Proposal (Submission) History"
            />
            <div className="flex items-center justify-between gap-5">
              {timeRanges.map((range) => (
                <Chip
                  key={range}
                  color="blue"
                  className="px-3 py-1 cursor-pointer capitalize text-sm"
                  isSelected={timeRange === range ? true : false}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Chip>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={500}>
            <AreaChart
              width={1000}
              height={500}
              data={finalConvertedData}
              margin={{ bottom: 60, left: 10, top: 20 }}
            >
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDarkMode
                    ? webbColors.mono['100']
                    : webbColors.mono['140'],
                }}
                tickMargin={6}
                tickCount={10}
                tickFormatter={(tickItem) => {
                  return tickItem % 1 === 0 ? tickItem : '';
                }}
                label={{
                  value: 'Number of Proposals',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />

              <XAxis
                dataKey="date"
                tickMargin={24}
                axisLine={false}
                tick={{
                  fill: isDarkMode
                    ? webbColors.mono['100']
                    : webbColors.mono['140'],
                }}
                tickFormatter={(tickItem) => {
                  return tickItem.split(',')[0] + ', ' + tickItem.split(',')[2];
                }}
                label={{ value: 'Date & Time', position: 'bottom', offset: 40 }}
              />

              <CartesianGrid
                horizontal={false}
                opacity={isDarkMode ? 0.1 : 0.2}
                stroke={
                  isDarkMode ? webbColors.mono['0'] : webbColors.mono['200']
                }
                strokeDasharray={4}
              />

              <Tooltip
                content={({ payload, label }) => {
                  let totalCount;

                  if (countData[label]) {
                    totalCount = countData[label].totalCount;
                  }

                  return (
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '10px',
                        color: '#000',
                        border: '2px solid #ccc',
                      }}
                    >
                      <p
                        style={{
                          color: webbColors.mono['200'],
                          marginBottom: '0.6rem',
                          fontWeight: 'bold',
                          paddingBottom: '0.6rem',
                          borderBottom: '1px solid #ccc',
                        }}
                      >{`Date: ${label}`}</p>

                      {totalCount && (
                        <p
                          style={{
                            color: webbColors.mono['200'],
                            marginBottom: '0.6rem',
                            paddingBottom: '0.6rem',
                            borderBottom: '1px solid #ccc',
                          }}
                        >{`Total no. of proposals: ${totalCount}`}</p>
                      )}

                      {payload?.map((item) => {
                        if (item.value === '0') return null;

                        return (
                          <p
                            style={{
                              color: allProposals.find(
                                (proposal) => proposal.type === item.name
                              )?.backgroundColor,
                              textTransform: 'capitalize',
                            }}
                            key={item.dataKey}
                          >
                            {`${item.dataKey}: ${item.value}`}
                          </p>
                        );
                      })}
                    </div>
                  );
                }}
              />

              <defs>
                {allProposals.map((type) => {
                  return (
                    <linearGradient
                      id={type.type}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                      key={type.type}
                    >
                      <stop
                        offset="50%"
                        stopColor={type.backgroundColor}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={type.backgroundColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  );
                })}
              </defs>

              {allProposals.map((type) => {
                return (
                  <Area
                    key={type.type}
                    type="monotone"
                    dataKey={type.type}
                    stackId={1}
                    stroke="none"
                    fill={`url(#${type.type})`}
                  />
                );
              })}

              <Legend
                verticalAlign="top"
                layout="vertical"
                align="right"
                wrapperStyle={{
                  paddingLeft: '20px',
                }}
                payload={allProposals.map((type) => ({
                  id: type.type,
                  value: type.type.charAt(0).toUpperCase() + type.type.slice(1),
                  type: 'circle',
                  color: type.backgroundColor,
                }))}
                content={<CustomizedLegend />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
};

// Helper Functions and Components for Proposal History Chart

function formatDateWithTime(timestamp: string) {
  const date = new Date(timestamp);

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

const CustomizedLegend = ({ payload }: { payload?: any }) => {
  const { isDarkMode } = useStatsContext();

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {payload.map((entry: any, index: any) => (
        <li
          key={`item-${index}`}
          style={{
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <Surface width={10} height={10}>
            <Symbols cx={5} cy={5} type="circle" size={50} fill={entry.color} />
          </Surface>
          <span
            style={{
              color: isDarkMode
                ? webbColors.mono['100']
                : webbColors.mono['140'],
              fontSize: '0.94em',
            }}
          >
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

function filterDatesByMinutes(data: any, minutes: number) {
  const now = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

  return data.filter((item: any) => {
    const itemDate = new Date(item.rawTimestamp);

    const minutesDifference =
      (new Date(now).getTime() - itemDate.getTime()) / 60000;

    return minutesDifference <= minutes;
  });
}
