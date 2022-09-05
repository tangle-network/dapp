declare module '*.svg' {
  const content: any;
  export default content;
}

/**
 * The base interface required all component to extends in their props
 */
export interface WebbComponentBase extends React.HTMLAttributes<HTMLElement> {
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

/**
 * Extract the props of a React element or component
 */
export type PropsOf<T extends React.ElementType<any>> = React.ComponentPropsWithoutRef<T>;
