import React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';

const ShieldedPoolUseCase1Component = (
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
        d="M18 1.5l12.326 2.739A1.5 1.5 0 0131.5 5.703v14.98a8.999 8.999 0 01-4.008 7.489L18 34.5l-9.492-6.328A8.996 8.996 0 014.5 20.684V5.703a1.5 1.5 0 011.175-1.464L18 1.5zm0 3.074L7.5 6.905v13.777a6 6 0 002.671 4.992L18 30.895l7.828-5.22a5.997 5.997 0 002.672-4.99V6.906L18 4.574z"
        fill="#000"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 7.688v4.5h-6v3h13.5l-7.5-7.5zm6 10.5H10.5l7.5 7.5v-4.5h6v-3z"
        fill="#1F1D2B"
      />
    </svg>
  );
};

export const ShieldedPoolUseCase1 = forwardRef(ShieldedPoolUseCase1Component);
