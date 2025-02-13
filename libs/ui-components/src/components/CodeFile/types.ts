export interface CodeFileProps {
  /**
   * The source code
   */
  code: string;

  /**
   * Loading state (optional)
   */
  isLoading?: boolean;

  /**
   * Error when loading code (optional)
   */
  error?: Error | null;

  /**
   * The function to fetch the source code (optional)
   */
  fetchCodeFnc?: () => Promise<void>;

  /**
   * The programming language of the code file (optional)
   */
  language?: string;

  /**
   * Track if the components is in a Next.js project or not
   * @default true
   */
  isInNextProject: boolean;

  /**
   * The tailwindcss className to override the style
   */
  className?: string;
}
