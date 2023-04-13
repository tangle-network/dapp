import React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';

const WhatIsTssSvgComponent = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => {
  return (
    <svg
      width={48}
      height={49}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      {...props}
    >
      <path
        d="M26.818 4.159a4.5 4.5 0 016.364 0l11.636 11.636a4.5 4.5 0 010 6.364L33.182 33.795a4.5 4.5 0 01-6.364 0L15.182 22.16a4.5 4.5 0 010-6.364L26.818 4.16z"
        fill="url(#prefix__paint0_linear_1653_218868)"
      />
      <path
        d="M5.333 44.977c0-.736.597-1.333 1.334-1.333h18.666a1.333 1.333 0 110 2.666H6.668a1.333 1.333 0 01-1.333-1.333z"
        fill="#ECF4FF"
      />
      <path
        d="M18.278 20.813a4 4 0 015.657 0l1.562 1.562a4 4 0 010 5.657l-.554.554-7.22-7.218.555-.555zM7.73 31.373a2 2 0 00-.395.75l-1.943 6.99a1.467 1.467 0 001.806 1.806l6.99-1.944a2 2 0 00.75-.394l-7.209-7.208z"
        fill="#C6BBFA"
      />
      <path
        d="M24.943 28.587l-7.219-7.22-9.876 9.877c-.042.041-.081.084-.119.129l7.209 7.208c.044-.037.087-.077.129-.118l9.876-9.876z"
        fill="#ECF4FF"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_1653_218868"
          x1={30}
          y1={0.977}
          x2={30}
          y2={36.977}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity={0.12} />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const WhatIsTssSvg = forwardRef(WhatIsTssSvgComponent);
