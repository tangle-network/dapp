import { useDarkMode } from '@webb-tools/webb-ui-components/hooks';
import { WebbColorsType } from '@webb-tools/webb-ui-components/types';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from /* preval */ '../../tailwind.config.js';
import { DonutDataType } from '../containers/DonutChartContainer/types';

const fullConfig: ReturnType<typeof resolveConfig> =
  resolveConfig(tailwindConfig);

/**
 * Get the color for donut chart
 * @returns an object where key if donut type and the value contains backgroud color, border color, and text color for donut chart
 */
export const useDonutColor = () => {
  const webbColors = fullConfig.theme?.colors as unknown as WebbColorsType;
  const [isDark] = useDarkMode();

  return {
    [DonutDataType.Open]: {
      bg: webbColors.green['10'],
      textColor: isDark ? webbColors.green['10'] : webbColors.green['70'],
      borderColor: webbColors.green['70'],
    },

    [DonutDataType.Rejected]: {
      bg: webbColors.red['10'],
      textColor: isDark ? webbColors.red['50'] : webbColors.red['70'],
      borderColor: webbColors.red['70'],
    },

    [DonutDataType.Signed]: {
      bg: webbColors.blue['10'],
      textColor: isDark ? webbColors.blue['50'] : webbColors.blue['70'],
      borderColor: webbColors.blue['70'],
    },

    [DonutDataType.Accepted]: {
      bg: webbColors.purple['10'],
      textColor: isDark ? webbColors.purple['50'] : webbColors.purple['70'],
      borderColor: webbColors.purple['70'],
    },
  };
};
