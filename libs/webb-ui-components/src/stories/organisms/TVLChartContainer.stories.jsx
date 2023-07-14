import { useState, useEffect, useMemo } from 'react';
import { TVLChartContainer } from '../../components';

export default {
  title: 'Design System/Organisms/TVLChartContainer',
  component: TVLChartContainer,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
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
    <TVLChartContainer
      {...args}
      currentTvlValue={currentTvlValue}
      tvlValue={tvlValue}
      setTvlValue={setTvlValue}
      tvlDate={tvlDate}
      setTVLDate={setTVLDate}
      tvlData={tvlData}
      isDarkMode={isDarkMode}
    />
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
