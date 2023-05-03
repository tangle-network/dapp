import Keyring from '@polkadot/keyring';

/**
 * Utility function to get a keyring instance from a uri
 * @param uri the uri of the keyring
 * @returns the keyring instance
 */
function getKeyring(uri: string) {
  const k = new Keyring({ type: 'sr25519' });
  return k.addFromUri(uri);
}

export default getKeyring;
