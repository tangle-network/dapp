import { ChartContainerProps } from './types';
/**
 * Container for charts (e.g. TVL, Volume, etc.) that displays chart heading, value, chart (should be passed as a child) and along with optional chart filters (e.g days, tokens and chains).
 *
 * Props for this component:
 *
 * - heading - Heading of the chart (Optional) - E.g. TVL, Volume 24H, etc.
 * - defaultValue - Default value when users not hovering on any part of the chart
 * - value - Value to be displayed when hovering a specific item over the chart (Tooltip response)
 * - date - Date corresponding to the value displayed beside value when hovering over the chart (Tooltip response)
 * - filterType - Type of filter to be displayed (Optional) - E.g. days (days, week, month), tokens and chains
 * - daysFilterType - Type of days filter to be displayed (Optional) - E.g. day, week, month
 * - setDaysFilterType - Function to set the days filter type (Optional)
 * - className - Optional className for the container
 */
export declare const ChartContainer: import('../../../../../node_modules/react').ForwardRefExoticComponent<ChartContainerProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
