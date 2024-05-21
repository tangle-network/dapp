import { createIcon } from './create-icon';
import { IconBase } from './types';

export const TangleIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 32 28',
    path: [
      <g clipPath="url(#clip0_828_2897)">
        <path
          d="M32 21.9598C32.0014 20.3605 31.2756 18.8261 29.9818 17.6934C28.6881 16.5606 26.9321 15.9221 25.0994 15.918L17.4484 15.918C17.4003 15.2958 17.3699 14.6596 17.3699 14C17.3699 13.3404 17.3396 12.7073 17.2969 12.082L25.0994 12.082C26.9162 12.0566 28.6488 11.4089 29.9233 10.2788C31.1978 9.14863 31.9121 7.62659 31.9121 6.041C31.9121 4.45541 31.1978 2.93337 29.9233 1.80323C28.6488 0.67309 26.9162 0.0254409 25.0994 -3.01633e-07L6.81321 -1.10095e-06C4.9964 0.02544 3.26386 0.673089 1.98936 1.80323C0.714863 2.93337 0.000568195 4.45541 0.000568126 6.041C0.000568057 7.62659 0.714862 9.14863 1.98936 10.2788C3.26386 11.4089 4.9964 12.0566 6.81321 12.082L14 12.25C14.5 12.25 14.5427 13.3404 14.5427 14C14.5427 14.6596 14.573 15.2927 14.6158 15.918L6.81321 15.918C4.9964 15.9434 3.26386 16.5911 1.98936 17.7212C0.714862 18.8514 0.000567499 20.3734 0.00056743 21.959C0.000567361 23.5446 0.714862 25.0666 1.98936 26.1968C3.26386 27.3269 4.9964 27.9746 6.81321 28L25.0994 28C26.9318 27.9959 28.6875 27.3576 29.9812 26.2252C31.2749 25.0928 32.0009 23.5588 32 21.9598ZM29.1727 6.04022C29.1732 6.98405 28.7446 7.8895 27.981 8.5579C27.2173 9.22631 26.181 9.60308 25.0994 9.60556L16.9974 9.60555C16.7039 7.83811 16.1447 6.11213 15.3342 4.47222C14.9768 3.7617 14.5193 3.09283 13.9723 2.48111L25.0994 2.48111C26.1798 2.48358 27.215 2.8595 27.9785 3.52656C28.7419 4.19362 29.1713 5.09747 29.1727 6.04022ZM6.81321 9.60555C5.72959 9.60555 4.69036 9.22992 3.92412 8.56129C3.15789 7.89266 2.72742 6.98581 2.72742 6.04022C2.72742 5.09464 3.15789 4.18778 3.92412 3.51915C4.69036 2.85052 5.7296 2.47489 6.81321 2.47489L8.64754 2.47489C10.2679 2.47489 11.8028 3.59489 12.7583 5.47244C13.4124 6.7954 13.8776 8.18352 14.1434 9.60555L6.81321 9.60555ZM2.7399 21.9598C2.73943 21.0159 3.16802 20.1105 3.93166 19.4421C4.6953 18.7737 5.73161 18.3969 6.81321 18.3944L14.9153 18.3944C15.2088 20.1619 15.768 21.8879 16.5785 23.5278C16.9358 24.2383 17.3933 24.9072 17.9404 25.5189L6.81321 25.5189C5.73285 25.5164 4.69762 25.1405 3.93418 24.4734C3.17074 23.8064 2.74131 22.9025 2.7399 21.9598ZM19.1651 22.5276C18.511 21.2046 18.0458 19.8165 17.78 18.3944L25.0994 18.3944C26.1831 18.3944 27.2223 18.7701 27.9885 19.4387C28.7548 20.1073 29.1852 21.0142 29.1852 21.9598C29.1852 22.9054 28.7548 23.8122 27.9885 24.4809C27.2223 25.1495 26.1831 25.5251 25.0994 25.5251L23.2651 25.5251C21.6518 25.5251 20.117 24.4051 19.1651 22.5276Z"
          fill="url(#tangle_icon_0)"
        />
        <path
          opacity="0.8"
          d="M32 6.04022C32.0014 7.63948 31.2756 9.17389 29.9818 10.3066C28.688 11.4394 26.9321 12.0779 25.0993 12.082L17.4481 12.082C17.4 12.7042 17.3697 13.3404 17.3697 14C17.3697 14.6596 17.3394 15.2927 17.2966 15.918L25.0993 15.918C26.9162 15.9434 28.6487 16.5911 29.9232 17.7212C31.1978 18.8514 31.9121 20.3734 31.9121 21.959C31.9121 23.5446 31.1978 25.0666 29.9232 26.1968C28.6487 27.3269 26.9162 27.9746 25.0993 28L6.81277 28C4.99592 27.9746 3.26335 27.3269 1.98883 26.1968C0.714308 25.0666 5.31303e-08 23.5446 7.20382e-08 21.959C9.09462e-08 20.3734 0.714308 18.8514 1.98883 17.7212C3.26335 16.5911 4.99592 15.9434 6.81277 15.918L13.9997 15.75C14.4997 15.75 14.5424 14.6596 14.5424 14C14.5424 13.3404 14.5727 12.7073 14.6155 12.082L6.81277 12.082C4.99592 12.0566 3.26335 11.4089 1.98883 10.2788C0.714308 9.14863 2.42951e-07 7.62659 2.61858e-07 6.041C2.80766e-07 4.45541 0.714308 2.93337 1.98883 1.80323C3.26335 0.673093 4.99592 0.0254399 6.81277 -3.00355e-07L25.0993 -8.22899e-08C26.9317 0.00411981 28.6875 0.642418 29.9812 1.77482C31.2749 2.90723 32.0009 4.44123 32 6.04022ZM29.1727 21.9598C29.1732 21.016 28.7446 20.1105 27.9809 19.4421C27.2173 18.7737 26.1809 18.3969 25.0993 18.3944L16.9971 18.3944C16.7036 20.1619 16.1444 21.8879 15.3339 23.5278C14.9765 24.2383 14.519 24.9072 13.9719 25.5189L25.0993 25.5189C26.1797 25.5164 27.2149 25.1405 27.9784 24.4734C28.7418 23.8064 29.1713 22.9025 29.1727 21.9598ZM6.81277 18.3944C5.72913 18.3944 4.68987 18.7701 3.92363 19.4387C3.15738 20.1073 2.7269 21.0142 2.7269 21.9598C2.7269 22.9054 3.15738 23.8122 3.92363 24.4808C4.68987 25.1495 5.72913 25.5251 6.81277 25.5251L8.64713 25.5251C10.2676 25.5251 11.8024 24.4051 12.7579 22.5276C13.412 21.2046 13.8772 19.8165 14.1431 18.3944L6.81277 18.3944ZM2.73939 6.04022C2.73891 6.98405 3.16751 7.8895 3.93117 8.55791C4.69482 9.22631 5.73115 9.60308 6.81277 9.60555L14.915 9.60555C15.2085 7.8381 15.7677 6.11213 16.5782 4.47222C16.9356 3.7617 17.3931 3.09283 17.9401 2.48111L6.81277 2.48111C5.73238 2.48358 4.69713 2.8595 3.93368 3.52656C3.17023 4.19362 2.7408 5.09747 2.73939 6.04022ZM19.1648 5.47244C18.5107 6.79541 18.0455 8.18352 17.7797 9.60555L25.0993 9.60555C26.183 9.60555 27.2222 9.22992 27.9885 8.56129C28.7547 7.89266 29.1852 6.98581 29.1852 6.04022C29.1852 5.09464 28.7547 4.18778 27.9885 3.51915C27.2222 2.85052 26.183 2.47489 25.0993 2.47489L23.265 2.47489C21.6516 2.47489 20.1168 3.59489 19.1648 5.47244Z"
          fill="url(#tangle_icon_1)"
        />
      </g>,
      <defs>
        <linearGradient
          id="tangle_icon_0"
          x1="2.38462"
          y1="1.77333"
          x2="26.529"
          y2="29.367"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E59FF" />
          <stop offset="1" stopColor="#6888F9" />
        </linearGradient>
        <linearGradient
          id="tangle_icon_1"
          x1="2.3841"
          y1="26.2267"
          x2="26.5285"
          y2="-1.36739"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E59FF" />
          <stop offset="1" stopColor="#6888F9" />
        </linearGradient>
        <clipPath id="clip0_828_2897">
          <rect
            width="28"
            height="32"
            fill="white"
            transform="translate(32) rotate(90)"
          />
        </clipPath>
      </defs>,
    ],
    displayName: 'TangleLogo',
  });
};
