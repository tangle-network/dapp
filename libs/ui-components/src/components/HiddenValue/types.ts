export type HiddenValueProps = {
  /**
   * The children must be a string.
   */
  children: string;

  /**
   * Number of star to display.
   *
   * @default children.length
   */
  numberOfStars?: number;
};
