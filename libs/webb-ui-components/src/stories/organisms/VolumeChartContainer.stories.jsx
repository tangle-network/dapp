import { useState, useEffect, useMemo } from 'react';
import { VolumeChartContainer } from '../../components';

export default {
  title: 'Design System/Organisms/VolumeChartContainer',
  component: VolumeChartContainer,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  const [currentVolumeValue, setCurrentVolumeValue] = useState(8.56);
  const [volumeDate, setVolumeDate] = useState(null);
  const [volumeValue, setVolumeValue] = useState(null);
  const [volumeDataType, setVolumeDataType] = useState('Week');

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

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };

    handleThemeChange();

    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  return (
    <VolumeChartContainer
      {...args}
      currentVolumeValue={currentVolumeValue}
      volumeValue={volumeValue}
      setVolumeValue={setVolumeValue}
      volumeDate={volumeDate}
      setVolumeDate={setVolumeDate}
      volumeData={volumeData}
      volumeDataType={volumeDataType}
      setVolumeDataType={setVolumeDataType}
      isDarkMode={isDarkMode}
    />
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
