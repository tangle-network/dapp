declare module '*.svg' {
  const content: any;
  export default content;
}

/**
 * The base interface required all component to extends in their props
 */
export interface WebbComponentBase {
  /**
   * The tailwindcss className to override the style
   */
  className?: string;
  /**
   * Control dark mode using `js`, if it's empty, the component will control dark mode in `css`
   */
  darkMode?: boolean;
  /**
   * Children node
   */
  children?: React.ReactNode;
}
