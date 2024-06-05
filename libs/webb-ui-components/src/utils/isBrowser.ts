import isSSR from './isSsr';

const isBrowser = () => !isSSR();

export default isBrowser;
