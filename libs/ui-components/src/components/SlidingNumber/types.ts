import type { MotionValue, SpringOptions } from 'framer-motion';

export interface SlidingNumberProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  number: number | string;
  startOnView?: boolean;
  padStart?: boolean;
  decimalSeparator?: string;
  thousandSeparator?: string;
  transition?: SpringOptions;
}

export interface NumberProps {
  prevValue: number;
  value: number;
  place: number;
  transition: SpringOptions;
}

export interface NumberDisplayProps {
  motionValue: MotionValue<number>;
  number: number;
  height: number;
  transition: SpringOptions;
}
