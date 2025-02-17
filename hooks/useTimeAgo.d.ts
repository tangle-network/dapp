export type TimeAgoOptions = {
    /**
     * If the component should update itself over time
     * @default true
     */
    live?: boolean;
    /**
     * Minimum amount of time in seconds between re-renders
     * @default 0
     */
    minPeriod?: number;
    /**
     * Maximum time between re-renders in seconds. The component should update at least once every `x` seconds
     * @default WEEK
     */
    maxPeriod?: number;
    /**
     * The Date to display. An actual Date object or something that can be fed to new Date
     */
    date: string | number | Date;
    /**
     * A function that returns what Date.now would return. Primarily for server
     * @default Date.now
     */
    now?: () => number;
    /** A function to decide how to format the date.
     * If you use this, react-timeago is basically acting like a glorified setInterval for you.
     */
    formatter?: (value: number, unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year', suffix: 'ago' | 'from now', epochMilliseconds: number, nextFormatter: () => React.ReactNode, now: () => number) => React.ReactNode;
};
declare const useTimeAgo: (opts: TimeAgoOptions) => import('../../../../node_modules/react').ReactNode;
export default useTimeAgo;
