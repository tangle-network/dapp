import React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';

const ShieldedPoolUseCase3Component = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => {
  return (
    <svg
      width={36}
      height={36}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={ref}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.061 22.654A12.002 12.002 0 0012.044 7.58l-1.488-2.605a14.994 14.994 0 0114.943.036c6.735 3.888 9.315 12.213 6.175 19.155l2.013 1.161-6.247 3.321-.248-7.071 1.87 1.078zm-19.021 4.33a12.001 12.001 0 01-3.105-13.637l1.869 1.079-.248-7.072-6.247 3.321 2.014 1.16c-3.14 6.942-.56 15.267 6.176 19.155a14.994 14.994 0 0014.943.036l-1.488-2.605a12.001 12.001 0 01-13.914-1.436zm10.081-4.743l.001.001h-.001zM15.876 18l4.245 4.241 6.364-6.362-2.12-2.121L20.12 18l-4.244-4.242-6.364 6.363 2.12 2.121L15.877 18z"
        fill="#1F1D2B"
      />
    </svg>
  );
};

export const ShieldedPoolUseCase3 = forwardRef(ShieldedPoolUseCase3Component);
