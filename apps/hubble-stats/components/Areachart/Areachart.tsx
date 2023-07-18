import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';
import { AreachartProps } from './types';

export const Areachart = (props: AreachartProps) => {
  const {
    data,
    setDate,
    setValue,
    isDarkMode,
    width = '100%',
    height = 180,
  } = props;

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart
        data={data}
        onMouseLeave={() => {
          setDate && setDate(null);
          setValue && setValue(null);
        }}
      >
        <XAxis
          dataKey="date"
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString('en-US', {
              day: 'numeric',
            })
          }
          strokeOpacity={0}
          tick={{
            fontSize: '16px',
            fill: '#9CA0B0',
            fontWeight: 400,
          }}
          tickMargin={16}
        />
        <Tooltip
          contentStyle={{ display: 'none' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              setValue && setValue(payload[0].payload['value']);
              setDate && setDate(payload[0].payload['date']);
            }

            return null;
          }}
        />
        <Area
          dataKey="value"
          stroke={isDarkMode ? '#C6BBFA' : '#624FBE'}
          fillOpacity={0}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
