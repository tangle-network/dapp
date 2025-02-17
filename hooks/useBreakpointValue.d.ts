declare function useBreakpointValue<BreakPoints extends Record<string, string>, Key extends keyof BreakPoints, V = unknown>(breakpoint: Key, value: V, fallback: V, breakpoints?: BreakPoints): V;
export default useBreakpointValue;
