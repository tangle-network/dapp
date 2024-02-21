import { createIcon } from './create-icon';
import { IconBase } from './types';

const CodeFill = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M15.3337 7.9997L10.6196 12.7137L9.67679 11.7709L13.4481 7.9997L9.67679 4.22845L10.6196 3.28564L15.3337 7.9997ZM2.55261 7.9997L6.32385 11.7709L5.38104 12.7137L0.666992 7.9997L5.38104 3.28564L6.32385 4.22845L2.55261 7.9997Z',
    displayName: 'CodeFill',
  });
};

export default CodeFill;
