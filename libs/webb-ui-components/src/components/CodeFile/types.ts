export interface CodeFileProps {
  /**
   * The function to fetch the code file
   */
  getCodeFileFnc: () => Promise<string>;
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
