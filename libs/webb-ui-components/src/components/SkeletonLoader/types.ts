export type SkeletonSize = 'md' | 'lg' | 'xl';

export interface SkeletonLoaderProps {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
   * @default "md"
   */
  size?: SkeletonSize;

  /**
   * The optional class name for overriding the style of the skeleton
   */
  className?: string;
}
