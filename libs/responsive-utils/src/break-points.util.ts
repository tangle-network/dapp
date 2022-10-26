/* eslint-disable sort-keys */
import { css, FlattenSimpleInterpolation } from 'styled-components';

export const size = {
  /*
   *   extra small: 390 px,
   * */
  xs: 390,
  /*
   *    small: 670 px,
   * */
  sm: 670,
  /*
   *   mid: 990,
   * */
  md: 990,
  /*
   *   large: 1200,
   * */
  lg: 1200,
  /*
   *   extra large: 1400,
   * */
  xl: 1400,
};
type Styler = Function | string | FlattenSimpleInterpolation;
type KeysToFunc<T extends object> = {
  [key in keyof T]: (styler: Styler) => FlattenSimpleInterpolation;
};
export type Size = typeof size;
type SizeEntry = keyof Size;

export const above: KeysToFunc<typeof size> = (Object.keys(size) as SizeEntry[]).reduce((acc: any, label) => {
  acc[label] = (styler?: Styler) => {
    if (!styler) {
      return '';
    }
    if (typeof styler === 'function') {
      return css`
        @media (min-width: ${size[label]}px) {
          ${styler()}
        }
      `;
    }
    return css`
      @media (min-width: ${size[label]}px) {
        ${css(styler as any)}
      }
    `;
  };
  return acc;
}, {} as KeysToFunc<typeof size>);

// todo fix this
export const below: KeysToFunc<typeof size> = (Object.keys(size) as SizeEntry[]).reduce((acc: any, label) => {
  acc[label] = (styler?: Styler) => {
    if (!styler) {
      return '';
    }
    if (typeof styler === 'function') {
      return css`
        @media (max-width: ${size[label]}px) {
          ${styler()}
        }
      `;
    }
    return css`
      @media (max-width: ${size[label]}px) {
        ${css(styler as any)}
      }
    `;
  };
  return acc;
}, {} as KeysToFunc<typeof size>);
