import React, { FC, ReactNode } from 'react';
import { BareProps } from './types';

type RenderParam = (() => ReactNode) | ReactNode;

interface ConditionProps extends BareProps {
  condition: (() => boolean) | boolean;
  match?: RenderParam;
  or?: RenderParam;
}

const render = (m: RenderParam): ReactNode => typeof m === 'function' ? m() : m;

export const Condition: FC<ConditionProps> = ({
  condition,
  match,
  or = (): ReactNode => null,
  children
}) => {
  const result = typeof condition === 'function' ? condition() : condition;

  return <>{(result ? render(match || children) : render(or))}</>;
};
