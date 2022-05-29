import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import * as React from 'react';

export const KLogo: React.FC = () => {
  const palette = useColorPallet();

  return (
    <svg width='36' height='37' viewBox='0 0 36 37' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='18' cy='18.5' r='17.75' fill='url(#paint0_linear_4_4389)' />
      <circle cx='18' cy='18.5' r='17.75' stroke='url(#paint1_radial_4_4389)' strokeWidth='0.5' />
      <circle cx='18' cy='18.5' r='17.75' stroke='url(#paint2_linear_4_4389)' stroke-opacity='0.35' strokeWidth='0.5' />
      <path
        d='M23.755 11.14L24.8058 12.0652L26.853 9.74H23.755V11.14ZM17.413 18.343L16.4231 19.3329L17.4779 20.3878L18.4638 19.2682L17.413 18.343ZM17.182 18.112L18.1719 17.1221L17.1182 16.0683L16.1322 17.1857L17.182 18.112ZM13.717 22.039L12.3355 22.2657L12.8134 25.179L14.7668 22.9653L13.717 22.039ZM13.276 19.351L12.2182 18.4339L11.7882 18.9299L11.8945 19.5777L13.276 19.351ZM20.395 11.14V9.74H19.7559L19.3372 10.2229L20.395 11.14ZM14.704 11.14H16.104V9.74H14.704V11.14ZM14.704 25V26.4H16.104V25H14.704ZM11.806 25H10.406V26.4H11.806V25ZM11.806 11.14V9.74H10.406V11.14H11.806ZM18.211 15.928L19.3957 15.1821L18.5986 13.916L17.3882 14.7953L18.211 15.928ZM23.923 25V26.4H26.4589L25.1077 24.2541L23.923 25ZM20.605 25L19.415 25.7375L19.8256 26.4H20.605V25ZM15.985 17.545L15.1622 16.4123L14.1098 17.1768L14.795 18.2825L15.985 17.545ZM22.7042 10.2148L16.3622 17.4178L18.4638 19.2682L24.8058 12.0652L22.7042 10.2148ZM18.4029 17.3531L18.1719 17.1221L16.1921 19.1019L16.4231 19.3329L18.4029 17.3531ZM16.1322 17.1857L12.6672 21.1127L14.7668 22.9653L18.2318 19.0383L16.1322 17.1857ZM15.0985 21.8123L14.6575 19.1243L11.8945 19.5777L12.3355 22.2657L15.0985 21.8123ZM14.3338 20.2681L21.4528 12.0571L19.3372 10.2229L12.2182 18.4339L14.3338 20.2681ZM20.395 12.54H23.755V9.74H20.395V12.54ZM13.304 11.14V25H16.104V11.14H13.304ZM14.704 23.6H11.806V26.4H14.704V23.6ZM13.206 25V11.14H10.406V25H13.206ZM11.806 12.54H14.704V9.74H11.806V12.54ZM17.0263 16.6739L22.7383 25.7459L25.1077 24.2541L19.3957 15.1821L17.0263 16.6739ZM23.923 23.6H20.605V26.4H23.923V23.6ZM21.795 24.2625L17.175 16.8075L14.795 18.2825L19.415 25.7375L21.795 24.2625ZM16.8078 18.6777L19.0338 17.0607L17.3882 14.7953L15.1622 16.4123L16.8078 18.6777Z'
        fill={palette.accentColor}
      />
      <defs>
        <linearGradient
          id='paint0_linear_4_4389'
          x1='36.6272'
          y1='12.9786'
          x2='-9.57555'
          y2='26.2608'
          gradientUnits='userSpaceOnUse'
        >
          <stop stop-color='#010101' stop-opacity='0' />
          <stop stop-opacity='0.9' />
          <stop offset='0.459707' stop-color='#363636' stop-opacity='0.971584' />
          <stop offset='0.827067' stop-color='#0A0A0A' stop-opacity='0.995031' />
          <stop offset='1' stop-color='#010101' />
          <stop offset='1' stop-color='white' stop-opacity='0' />
        </linearGradient>
        <radialGradient
          id='paint1_radial_4_4389'
          cx='0'
          cy='0'
          r='1'
          gradientUnits='userSpaceOnUse'
          gradientTransform='translate(-8.03636 28.6916) rotate(-22.7613) scale(26.3423 20.601)'
        >
          <stop stop-color='#343434' />
          <stop offset='1' stop-color='#A4A4A4' stop-opacity='0' />
        </radialGradient>
        <linearGradient
          id='paint2_linear_4_4389'
          x1='15.9636'
          y1='18.5'
          x2='53.5652'
          y2='38.1092'
          gradientUnits='userSpaceOnUse'
        >
          <stop stop-color='#3D3F3E' />
          <stop offset='1' stop-color='#606261' />
        </linearGradient>
      </defs>
    </svg>
  );
};
