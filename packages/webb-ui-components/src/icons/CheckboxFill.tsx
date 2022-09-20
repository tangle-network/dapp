import { createIcon } from './create-icon';
import { IconBase } from './types';

export const CheckboxFill = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <g clipPath='url(#clip0_163_4181)'>
        <path d='M4 3H20C20.2652 3 20.5196 3.10536 20.7071 3.29289C20.8946 3.48043 21 3.73478 21 4V20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V4C3 3.73478 3.10536 3.48043 3.29289 3.29289C3.48043 3.10536 3.73478 3 4 3ZM11.003 16L18.073 8.929L16.659 7.515L11.003 13.172L8.174 10.343L6.76 11.757L11.003 16Z' />
      </g>,
      <defs>
        <clipPath id='clip0_163_4181'>
          <rect width='24' height='24' fill={props.darkMode ? 'black' : 'white'} />
        </clipPath>
      </defs>,
    ],
    displayName: 'CheckboxFill',
  });
};
