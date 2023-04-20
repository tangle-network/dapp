import React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';

const UseCase4SvgComponent = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>
) => {
  return (
    <svg
      width="48"
      height="52"
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.818 3.18198C28.5754 1.42462 31.4246 1.42462 33.182 3.18198L44.818 14.818C46.5754 16.5754 46.5754 19.4246 44.818 21.182L33.182 32.818C31.4246 34.5754 28.5754 34.5754 26.818 32.818L15.182 21.182C13.4246 19.4246 13.4246 16.5754 15.182 14.818L26.818 3.18198Z"
        fill="url(#paint0_linear_1881_3707)"
      />
      <path
        d="M33 25.0109C33 22.7599 30.6132 21.3108 28.6161 22.3492L21.3167 26.1444C20.9917 26.3133 20.6162 26.3576 20.2609 26.2687L15.9485 25.1906C15.1981 25.003 14.4041 25.1126 13.7325 25.4963L4.51158 30.7654C3.57686 31.2996 3 32.2936 3 33.3702V42.9997C3 44.6565 4.34315 45.9997 6 45.9997H30C31.6569 45.9997 33 44.6565 33 42.9997V25.0109Z"
        fill="#ECF4FF"
      />
      <path
        d="M13.688 35.9919L3.97331 39.6349C3.38786 39.8544 3 40.4141 3 41.0394V42.9999C3 44.6567 4.34315 45.9998 6 45.9998H30C31.6569 45.9998 33 44.6567 33 42.9999V33.9999C33 32.9526 31.9539 32.2277 30.9733 32.5954L22.312 36.5079C21.4576 36.8283 20.5259 36.8813 19.6406 36.66L16.3594 35.8397C15.4741 35.6184 14.5424 35.6715 13.688 35.9919Z"
        fill="#624FBE"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1881_3707"
          x1="30"
          y1="0"
          x2="30"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.12" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const UseCase4Svg = forwardRef(UseCase4SvgComponent);
