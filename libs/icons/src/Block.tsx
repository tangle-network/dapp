import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Block = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <path
        d='M12.05 3.0681L19.7103 7.49075C19.7412 7.50861 19.7603 7.54162 19.7603 7.57735V16.4226C19.7603 16.4584 19.7412 16.4914 19.7103 16.5093L12.05 20.9319C12.0191 20.9498 11.9809 20.9498 11.95 20.9319L4.28975 16.5093C4.25881 16.4914 4.23975 16.4584 4.23975 16.4226V7.57735C4.23975 7.54162 4.25881 7.50861 4.28975 7.49075L11.95 3.0681C11.9809 3.05023 12.0191 3.05024 12.05 3.0681Z'
        stroke='inherit'
        strokeWidth='1.8'
      />,
      <path d='M19.6604 8L12.0001 12L4.33984 8' stroke='inherit' strokeWidth='1.8' />,
      <path d='M11.87 20.9375L11.87 12' stroke='inherit' strokeWidth='1.8' />,
    ],
    displayName: 'Block',
    colorUsingStroke: true,
  });
};
