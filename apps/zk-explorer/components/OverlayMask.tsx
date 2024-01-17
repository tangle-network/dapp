'use client';

import { PropsOf } from '@webb-tools/webb-ui-components/types';
import assert from 'assert';
import { FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export type OverlayMaskProps = PropsOf<'div'> & {
  /**
   * A number between 0 and 1, representing the opacity of the
   * overlay.
   */
  opacity: number;

  /**
   * If true, the overlay will be rendered on top of everything
   * else, by having a z-index of 20.
   */
  isPrevalent?: boolean;

  /**
   * If true, the body will be prevented from scrolling by having
   * its overflow set to `hidden`.
   */
  doPreventBodyScrolling?: boolean;
};

const OverlayMask: FC<OverlayMaskProps> = ({
  opacity,
  className,
  children,
  isPrevalent,
  doPreventBodyScrolling,
  ...rest
}) => {
  assert(opacity >= 0 && opacity <= 1, 'Opacity must be between 0 and 1');

  useEffect(() => {
    document.body.style.overflow = doPreventBodyScrolling ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [doPreventBodyScrolling]);

  return (
    <>
      <div
        {...rest}
        className={twMerge(
          'absolute top-0 left-0 right-0 bottom-0 bg-black',
          isPrevalent ? 'z-20' : '',
          className
        )}
        style={{ opacity }}
      />

      {children}
    </>
  );
};

export default OverlayMask;
