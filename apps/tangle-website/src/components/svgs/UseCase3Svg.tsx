import React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';

const UseCase3SvgComponent = (
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
        fill="url(#paint0_linear_1881_3692)"
      />
      <path
        d="M28.2735 42.1519L10.1822 24.0605L9.14539 24.8156C5.94466 27.1467 4.19384 30.3391 3.4054 32.1098C2.8678 33.3171 2.8678 34.6828 3.4054 35.8902C4.70939 38.8186 8.83758 46 18.0007 46C21.7026 46 24.6203 44.8124 26.8555 43.1847L28.2735 42.1519Z"
        fill="#ECF4FF"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14.818 30.8179C14.0037 31.6322 13.5 32.7572 13.5 33.9999C13.5 36.4851 15.5147 38.4999 18 38.4999C19.2426 38.4999 20.3676 37.9962 21.182 37.1818L14.818 30.8179Z"
        fill="#624FBE"
      />
      <path
        d="M18.0004 22C27.1638 22 31.2916 29.1817 32.5954 32.1101C33.1328 33.3173 33.1328 34.6827 32.5954 35.8899C32.3619 36.4143 32.0487 37.0528 31.6445 37.7513C31.2296 38.4683 30.3119 38.7132 29.5949 38.2983C28.8779 37.8834 28.633 36.9657 29.0479 36.2487C29.3922 35.6537 29.6582 35.1111 29.8547 34.6697C30.0464 34.2393 30.0464 33.7607 29.8547 33.3303C28.6655 30.6591 25.2834 25 18.0004 25L16.5 25C15.6716 25 15 24.3285 15 23.5C15 22.6716 15.6716 22 16.5 22L18.0004 22Z"
        fill="#ECF4FF"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.43934 19.4393C4.02513 18.8536 4.97487 18.8536 5.56066 19.4393L32.5607 46.4393C33.1464 47.0251 33.1464 47.9749 32.5607 48.5607C31.9749 49.1464 31.0251 49.1464 30.4393 48.5607L3.43934 21.5607C2.85355 20.9749 2.85355 20.0251 3.43934 19.4393Z"
        fill="#624FBE"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1881_3692"
          x1="30"
          y1="0"
          x2="30"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="white" stop-opacity="0.12" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const UseCase3Svg = forwardRef(UseCase3SvgComponent);
