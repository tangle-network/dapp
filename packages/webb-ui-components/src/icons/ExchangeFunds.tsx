import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ExchangeFunds = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M19.3741 15.103C20.7045 11.9419 19.8722 8.28443 17.305 6.01024C14.7378 3.73605 11.0066 3.351 8.02906 5.05299L7.03706 3.31599C10.1255 1.55085 13.9192 1.55999 16.9991 3.33999C21.4891 5.93199 23.2091 11.482 21.1161 16.11L22.4581 16.884L18.2931 19.098L18.1281 14.384L19.3741 15.103ZM6.69314 17.9897C4.12625 15.7158 3.29387 12.0591 4.62353 8.89825L5.86906 9.61699L5.70406 4.90299L1.53906 7.11699L2.88206 7.88999C0.789063 12.518 2.50906 18.068 6.99906 20.66C10.0789 22.44 13.8727 22.4491 16.9611 20.684L15.9691 18.947C12.9915 20.649 9.26037 20.2639 6.69314 17.9897ZM13.4143 14.8275L13.4148 14.828H13.4138L13.4143 14.8275ZM10.5838 12L13.4143 14.8275L17.6568 10.586L16.2428 9.172L13.4138 12L10.5848 9.172L6.3418 13.414L7.7558 14.828L10.5838 12Z'
        fill='inherit'
      />
    ),
    displayName: 'ExchangeFunds',
  });
};
