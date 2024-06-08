declare module '*.svg' {
  const content: unknown;
  export const ReactComponent: unknown;
  export default content;
}

interface EthereumProvider {
  isMetaMask?: boolean;

  request: (options: {
    method: string;
    params?: Array<unknown>;
  }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum: EthereumProvider;
  }
}
