import { RelayerListCardProps } from './types';
/**
 * The relayer list card component
 *
 * Props:
 *
 * - `isDisconnected`: If the user is disconnected
 * - `onChange`: The callback when the relayer is changed
 * - `onClose`: The callback when the card is closed
 * - `onConnectWallet`: The callback when the user clicks on the connect wallet button
 * - `relayers`: The list of relayers
 * - `value`: The selected relayer
 */
declare const RelayerListCard: import('../../../../../node_modules/react').ForwardRefExoticComponent<RelayerListCardProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
export default RelayerListCard;
