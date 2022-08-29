import { createIcon } from './create-icon';
import { IconBase } from './types';

export const BankLine = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <g clipPath='url(#prefix__clip0_163_4126)'>
        <path
          d='M2 20h20v2H2v-2zm2-8h2v7H4v-7zm5 0h2v7H9v-7zm4 0h2v7h-2v-7zm5 0h2v7h-2v-7zM2 7l10-5 10 5v4H2V7zm2 1.236V9h16v-.764l-8-4-8 4zM12 8a1 1 0 110-2 1 1 0 010 2z'
          fill='inherit'
        />
      </g>,
      <defs>
        <clipPath id='prefix__clip0_163_4126'>
          <path fill='#fff' d='M0 0h24v24H0z' />
        </clipPath>
      </defs>,
    ],
    displayName: 'BankLine',
  });
};
