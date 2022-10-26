import styled from 'styled-components';
import { FC, memo, useLayoutEffect, useState } from 'react';
import { Motion, spring } from 'react-motion';

const SliderRoot = styled.div.attrs<{ top: number }>(({ top }) => ({
  style: { top: top + 'px' },
}))<{ top: number }>`
  position: absolute;
  left: 0;
  width: 5px;
  height: var(--sidebar-item-height);
  background: var(--color-primary);
`;

interface SliderProps {
  target: HTMLElement | null;
}

export const Slider: FC<SliderProps> = memo(({ target }) => {
  const [currentTop, setCurrentTop] = useState<number>(0);

  useLayoutEffect(() => {
    if (!target) {
      return;
    }

    const { top } = target.getBoundingClientRect();

    setCurrentTop(top);
  }, [target, setCurrentTop]);

  if (!currentTop) {
    return null;
  }

  return (
    <Motion defaultStyle={{ top: currentTop }} style={{ top: spring(currentTop) }}>
      {(style): JSX.Element => <SliderRoot top={style.top} />}
    </Motion>
  );
});

Slider.displayName = 'Slider';
