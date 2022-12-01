import { createIcon } from './create-icon';
import { IconBase } from './types';

export const UserStarFill = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path d="M8 13V21H0C0 18.8783 0.842855 16.8434 2.34315 15.3431C3.84344 13.8429 5.87827 13 8 13ZM14 20.5L11.061 22.045L11.622 18.773L9.245 16.455L12.531 15.977L14 13L15.47 15.977L18.755 16.455L16.378 18.773L16.938 22.045L14 20.5ZM8 12C4.685 12 2 9.315 2 6C2 2.685 4.685 0 8 0C11.315 0 14 2.685 14 6C14 9.315 11.315 12 8 12Z" />
    ),
    displayName: 'UserStarFill',
  });
};
