import React, { createRef, FC, PropsWithChildren, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Motion, spring, presets } from 'react-motion';
import styled from 'styled-components';
import { BareProps } from './types';

export const Fadein: FC<PropsWithChildren<any>> = ({ children }) => {
  return (
    <Motion
      defaultStyle={{ opacity: 0 }}
      style={{ opacity: spring(1, presets.gentle) }}
    >
      {
        (style): JSX.Element => (<div style={{ height: '100%', opacity: style.opacity, width: '100%' }}>{children}</div>)
      }
    </Motion>
  );
};

const TextAnimationRoot = styled.div`
  position: relative;
  width: 100%;
`;

const TextAnimationItem = styled.div.attrs<{ opacity: number; top: number }>(({ opacity, top }) => ({
  style: {
    opacity: opacity,
    transform: `translateY(${top * 100}%)`
  }
}))<{ opacity: number; top: number }>`
  position: absolute;
  top: 0;
  left: 0;
`;

export const TextAnimation: FC<{ value: ReactNode } & BareProps> = ({ className, value }) => {
  const [prevValue, setPrevValue] = useState<ReactNode>('');
  const valueRef = useRef<ReactNode>('');
  const $value = createRef<HTMLDivElement>();
  const $container = createRef<HTMLDivElement>();
  const [motionData, setMotionData] = useState({
    currentEndOpacity: 0,
    currentEndTop: 0,
    prevEndOpacity: 0,
    prevEndTop: 0
  });

  useEffect(() => {
    if (value !== valueRef.current) {
      setPrevValue(valueRef.current);
      setMotionData({
        currentEndOpacity: 1,
        currentEndTop: 0,
        prevEndOpacity: 0,
        prevEndTop: -1
      });
      valueRef.current = value;
    }
  /* eslint-disable-next-line */
  }, [value, setPrevValue, setMotionData]);

  useLayoutEffect(() => {
    if (!$value.current || !$container.current) return;

    const height = window.getComputedStyle($value.current).height;

    $container.current.setAttribute('style', `height: ${height}`);
  }, [$value, $container]);

  return (
    <TextAnimationRoot
      className={className}
      ref={$container}
    >
      <Motion
        defaultStyle={{
          opacity: 1,
          top: 0
        }}
        key={`motion-prev-${prevValue}`}
        style={{
          opacity: spring(motionData.prevEndOpacity, presets.gentle),
          top: spring(motionData.prevEndTop, presets.gentle)
        }}
      >
        {
          (style): JSX.Element => {
            return (
              <TextAnimationItem
                opacity={style.opacity}
                top={style.top}
              >
                {prevValue}
              </TextAnimationItem>
            );
          }
        }
      </Motion>
      <Motion
        defaultStyle={{
          opacity: 0,
          top: 1
        }}
        key={`motion-current-${value}`}
        style={{
          opacity: spring(motionData.currentEndOpacity, presets.gentle),
          top: spring(motionData.currentEndTop, presets.gentle)
        }}
      >
        {
          (style): JSX.Element => (
            <TextAnimationItem
              opacity={style.opacity}
              ref={$value}
              top={style.top}
            >
              {value}
            </TextAnimationItem>
          )
        }
      </Motion>
    </TextAnimationRoot>
  );
};
