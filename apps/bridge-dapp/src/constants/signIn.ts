const domain = process.env.REACT_APP_DOMAIN ?? 'localhost';

const origin = `http${domain === 'localhost' ? '' : 's'}://${domain}/login`;

console.log('origin', origin);
console.log('domain', domain);

export const SIGN_IN_MESSAGE = `
Logging into Webb's Hubble Bridge!

Domain: {domain}
Origin: {origin}
Address: {address}
Chain ID: {chainId}

To access your account and continue your journey, please sign in with your Ethereum account.

Your privacy is important to us. We will never store or share your private keys.

By signing in, you acknowledge and agree to our terms of service and privacy policy.
`;

export function createSignInMessage(address: string, chainId: number) {
  return SIGN_IN_MESSAGE.replace('{domain}', domain)
    .replace('{origin}', origin)
    .replace('{address}', address)
    .replace('{chainId}', chainId.toString());
}
