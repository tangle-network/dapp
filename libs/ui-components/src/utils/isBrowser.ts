import isSSR from './isSSR';

const isBrowser = () => !isSSR();

export default isBrowser;
