import React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';

const ShieldedPoolUseCase2Component = (
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
        d="M27 10.5h4.5A1.5 1.5 0 0133 12v18a1.5 1.5 0 01-1.5 1.5h-27A1.5 1.5 0 013 30V6a1.5 1.5 0 011.5-1.5H27v6zm-21 3v15h24v-15H6zm0-6v3h18v-3H6zm16.5 12H27v3h-4.5v-3z"
        fill="#1F1D2B"
      />
    </svg>
  );
};

export const ShieldedPoolUseCase2 = forwardRef(ShieldedPoolUseCase2Component);
