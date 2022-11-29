export interface IconWithTooltipProp {
  /**
   * The icon to display
   */
  icon: React.ReactNode;

  /**
   * The tooltip content
   */
  content: React.ReactNode;

  /**
   * The tooltip trigger className for tailwind styling
   */
  btnClassName?: string;
}
