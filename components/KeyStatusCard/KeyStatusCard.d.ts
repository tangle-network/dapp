import { KeyStatusCardProps } from './types';
/**
 * The `KeyStatusCard` component displays the current key and next key data
 *
 * ```jsx
 *  import { useKeyStatusSeedData } from "@tangle-network/ui-components";
 *
 *  const statusCardData = useKeyStatusSeedData();
 *
 *  // ...
 *
 *  <KeyStatusCard className='max-w-[680px] mt-6' {...statusCardData} />
 * ```
 */
export declare const KeyStatusCard: React.FC<KeyStatusCardProps>;
