type AnchorWithSignatureBridgeMapType = Record<string, string>;
type ChainWithAnchorsMapType = Record<number, AnchorWithSignatureBridgeMapType>;

/**
 * TODO: Remove this, keep this for now to avoid the build error
 */
export const anchorSignatureBridge: ChainWithAnchorsMapType = {};
