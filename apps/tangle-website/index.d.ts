/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

declare namespace JSX {
  interface IntrinsicElements {
    'dotlottie-player': any;
  }
}
