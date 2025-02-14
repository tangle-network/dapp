import { ComponentBase } from '../../types';

/**
 * The `KeyCard` props
 */
export interface KeyCardProps extends ComponentBase {
  /**
   * The key type (compressed or uncompressed key)
   */
  title: string;
  /**
   * The key value to display
   */
  keyValue: string;
}
