import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, BarChart, Bar } from 'recharts';
import { VolumeChartWrapper } from '../../components';

export default {
  title: 'Design System/Organisms/VolumeChartWrapper',
  component: VolumeChartWrapper,
};

export const TVL = () => {
  const [currentTvlValue, setCurrentTvlValue] = useState(13.6);
  const [tvlValue, setTvlValue] = useState(null);
  const [tvlDate, setTVLDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const tvlData = useMemo(() => {
    const data = [];

    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 20) + 1,
      });
    }

    return data;
  }, []);

  return (
    <VolumeChartWrapper
      heading="TVL"
      currentValue={currentTvlValue}
      value={tvlValue}
      date={tvlDate}
    >
      <AreaChart
        width={560}
        height={180}
        data={tvlData}
        onMouseLeave={() => {
          setTVLDate && setTVLDate(null);
          setTvlValue && setTvlValue(null);
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
              setTvlValue && setTvlValue(payload[0].payload['value']);
              setTVLDate && setTVLDate(payload[0].payload['date']);
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
    </VolumeChartWrapper>
  );
};

export const Volume = () => {
  const [currentVolumeValue, setCurrentVolumeValue] = useState(8.56);
  const [volumeDate, setVolumeDate] = useState(null);
  const [volumeValue, setVolumeValue] = useState(null);
  const [volumeDataType, setVolumeDataType] = useState('week');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const volumeData = useMemo(() => {
    const data = [];

    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 20) + 1,
      });
    }

    return data;
  }, []);

  return (
    <VolumeChartWrapper
      heading="Volume 24H"
      currentValue={currentVolumeValue}
      value={volumeValue}
      date={volumeDate}
      filterType="days"
      daysFilterType={volumeDataType}
      setDaysFilterType={setVolumeDataType}
    >
      <BarChart
        width={560}
        height={180}
        data={volumeData}
        onMouseLeave={() => {
          setVolumeValue && setVolumeValue(null);
          setVolumeDate && setVolumeDate(null);
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
              setVolumeValue && setVolumeValue(payload[0].payload['value']);
              setVolumeDate && setVolumeDate(payload[0].payload['date']);
            }

            return null;
          }}
        />
        <Bar dataKey="value" fill={isDarkMode ? '#81B3F6' : '#3D7BCE'} />
      </BarChart>
    </VolumeChartWrapper>
  );
};
