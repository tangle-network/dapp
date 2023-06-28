import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Tangle = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <>
        <path
          d="M22.5 16.9749C22.5009 15.9753 22.0473 15.0163 21.2387 14.3084C20.4301 13.6004 19.3326 13.2013 18.1872 13.1988L13.4053 13.1988C13.3752 12.8099 13.3562 12.4122 13.3562 12C13.3562 11.5878 13.3373 11.1921 13.3106 10.8013L18.1872 10.8013C19.3227 10.7853 20.4055 10.3806 21.2021 9.67423C21.9986 8.96789 22.4451 8.01662 22.4451 7.02563C22.4451 6.03463 21.9986 5.08336 21.2021 4.37702C20.4055 3.67068 19.3227 3.2659 18.1872 3.25L6.75827 3.25C5.62276 3.2659 4.53993 3.67068 3.74337 4.37702C2.9468 5.08336 2.50037 6.03463 2.50037 7.02562C2.50037 8.01662 2.9468 8.96789 3.74337 9.67423C4.53993 10.3806 5.62276 10.7853 6.75827 10.8012L11.25 10.9063C11.5625 10.9063 11.5892 11.5878 11.5892 12C11.5892 12.4122 11.6081 12.8079 11.6349 13.1988L6.75827 13.1988C5.62276 13.2147 4.53993 13.6194 3.74337 14.3258C2.9468 15.0321 2.50037 15.9834 2.50037 16.9744C2.50037 17.9654 2.9468 18.9166 3.74337 19.623C4.53993 20.3293 5.62276 20.7341 6.75827 20.75L18.1872 20.75C19.3324 20.7474 20.4297 20.3485 21.2383 19.6407C22.0468 18.933 22.5006 17.9742 22.5 16.9749ZM20.733 7.02514C20.7333 7.61503 20.4654 8.18094 19.9881 8.59869C19.5109 9.01644 18.8632 9.25193 18.1872 9.25347L13.1234 9.25347C12.9399 8.14882 12.5904 7.07008 12.0839 6.04514C11.8605 5.60106 11.5746 5.18302 11.2327 4.80069L18.1872 4.80069C18.8624 4.80224 19.5094 5.03719 19.9866 5.4541C20.4637 5.87101 20.7321 6.43592 20.733 7.02514ZM6.75827 9.25347C6.08101 9.25347 5.43149 9.0187 4.95259 8.60081C4.4737 8.18292 4.20465 7.61613 4.20465 7.02514C4.20465 6.43415 4.4737 5.86736 4.95259 5.44947C5.43149 5.03158 6.08101 4.79681 6.75827 4.79681L7.90473 4.79681C8.91748 4.79681 9.87676 5.49681 10.4739 6.67028C10.8827 7.49713 11.1735 8.3647 11.3396 9.25347L6.75827 9.25347ZM4.21245 16.9749C4.21216 16.385 4.48003 15.8191 4.9573 15.4013C5.43458 14.9836 6.08227 14.7481 6.75827 14.7465L11.8221 14.7465C12.0055 15.8512 12.355 16.9299 12.8616 17.9549C13.0849 18.3989 13.3708 18.817 13.7128 19.1993L6.75827 19.1993C6.08304 19.1978 5.43602 18.9628 4.95888 18.5459C4.48173 18.129 4.21334 17.5641 4.21245 16.9749ZM14.4782 17.3297C14.0694 16.5029 13.7786 15.6353 13.6125 14.7465L18.1872 14.7465C18.8644 14.7465 19.5139 14.9813 19.9928 15.3992C20.4717 15.8171 20.7408 16.3839 20.7408 16.9749C20.7408 17.5659 20.4717 18.1326 19.9928 18.5505C19.5139 18.9684 18.8644 19.2032 18.1872 19.2032L17.0407 19.2032C16.0324 19.2032 15.0731 18.5032 14.4782 17.3297Z"
          fill="#D3D8E2"
        />
        ,
        <path
          opacity="0.8"
          d="M22.5 7.02514C22.5009 8.02468 22.0472 8.98368 21.2386 9.69164C20.43 10.3996 19.3325 10.7987 18.1871 10.8013L13.4051 10.8013C13.375 11.1901 13.3561 11.5878 13.3561 12C13.3561 12.4122 13.3371 12.8079 13.3104 13.1988L18.1871 13.1988C19.3226 13.2147 20.4055 13.6194 21.202 14.3258C21.9986 15.0321 22.445 15.9834 22.445 16.9744C22.445 17.9654 21.9986 18.9166 21.202 19.623C20.4055 20.3293 19.3226 20.7341 18.1871 20.75L6.75798 20.75C5.62245 20.7341 4.53959 20.3293 3.74302 19.623C2.94644 18.9166 2.5 17.9654 2.5 16.9744C2.5 15.9834 2.94644 15.0321 3.74302 14.3258C4.53959 13.6194 5.62245 13.2147 6.75798 13.1988L11.2498 13.0937C11.5623 13.0937 11.589 12.4122 11.589 12C11.589 11.5878 11.6079 11.1921 11.6347 10.8013L6.75798 10.8013C5.62245 10.7853 4.53959 10.3806 3.74302 9.67423C2.94644 8.96789 2.5 8.01662 2.5 7.02563C2.5 6.03463 2.94644 5.08336 3.74302 4.37702C4.53959 3.67068 5.62245 3.2659 6.75798 3.25L18.1871 3.25C19.3323 3.25257 20.4297 3.65151 21.2382 4.35926C22.0468 5.06702 22.5006 6.02577 22.5 7.02514ZM20.7329 16.9749C20.7332 16.385 20.4654 15.8191 19.9881 15.4013C19.5108 14.9836 18.8631 14.7481 18.1871 14.7465L13.1232 14.7465C12.9398 15.8512 12.5902 16.9299 12.0837 17.9549C11.8603 18.3989 11.5744 18.817 11.2325 19.1993L18.1871 19.1993C18.8623 19.1978 19.5093 18.9628 19.9865 18.5459C20.4637 18.129 20.7321 17.5641 20.7329 16.9749ZM6.75798 14.7465C6.0807 14.7465 5.43117 14.9813 4.95226 15.3992C4.47336 15.8171 4.20431 16.3839 4.20431 16.9749C4.20431 17.5659 4.47336 18.1326 4.95226 18.5505C5.43117 18.9684 6.0807 19.2032 6.75798 19.2032L7.90445 19.2032C8.91723 19.2032 9.87652 18.5032 10.4737 17.3297C10.8825 16.5029 11.1733 15.6353 11.3394 14.7465L6.75798 14.7465ZM4.21211 7.02514C4.21182 7.61503 4.47969 8.18094 4.95698 8.59869C5.43426 9.01645 6.08197 9.25193 6.75798 9.25347L11.8219 9.25347C12.0053 8.14882 12.3548 7.07008 12.8614 6.04514C13.0847 5.60106 13.3707 5.18302 13.7126 4.8007L6.75798 4.8007C6.08274 4.80224 5.43571 5.03719 4.95855 5.4541C4.4814 5.87101 4.213 6.43592 4.21211 7.02514ZM14.478 6.67028C14.0692 7.49713 13.7785 8.3647 13.6123 9.25347L18.1871 9.25347C18.8643 9.25347 19.5139 9.0187 19.9928 8.60081C20.4717 8.18292 20.7407 7.61613 20.7407 7.02514C20.7407 6.43415 20.4717 5.86736 19.9928 5.44947C19.5139 5.03158 18.8643 4.79681 18.1871 4.79681L17.0406 4.79681C16.0323 4.79681 15.073 5.49681 14.478 6.67028Z"
          fill="#D3D8E2"
        />
      </>
    ),
    displayName: 'Tangle',
  });
};
