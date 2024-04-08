/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
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
