import assert from 'assert';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import useMeasure from 'react-use-measure';
import { twMerge } from 'tailwind-merge';
import { NumberDisplayProps, NumberProps, SlidingNumberProps } from './types';

const NumberDisplay = ({
  motionValue,
  number,
  height,
  transition,
}: NumberDisplayProps) => {
  const y = useTransform(motionValue, (latest) => {
    if (!height) return 0;
    const currentNumber = latest % 10;
    const offset = (10 + number - currentNumber) % 10;
    let translateY = offset * height;
    if (offset > 5) translateY -= 10 * height;
    return translateY;
  });

  if (!height) {
    return <span className="invisible absolute">{number}</span>;
  }

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
      transition={{ ...transition, type: 'spring' }}
    >
      {number}
    </motion.span>
  );
};

const NumberRoller = ({ prevValue, value, place, transition }: NumberProps) => {
  const startNumber = Math.floor(prevValue / place) % 10;
  const targetNumber = Math.floor(value / place) % 10;
  const animatedValue = useSpring(startNumber, transition);

  useEffect(() => {
    animatedValue.set(targetNumber);
  }, [targetNumber, animatedValue]);

  const [measureRef, { height }] = useMeasure();

  return (
    <div
      ref={measureRef}
      className="relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none tabular-nums"
    >
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <NumberDisplay
          key={i}
          motionValue={animatedValue}
          number={i}
          height={height}
          transition={transition}
        />
      ))}
    </div>
  );
};

const SlidingNumber = forwardRef<HTMLSpanElement, SlidingNumberProps>(
  (
    {
      number,
      className,
      startOnView = false,
      padStart = false,
      decimalSeparator = '.',
      thousandSeparator = ',',
      transition = {
        stiffness: 200,
        damping: 20,
        mass: 0.4,
      },
      ...props
    },
    ref,
  ) => {
    const viewRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(viewRef, { once: true });

    useImperativeHandle(ref, () => {
      assert(viewRef.current !== null, 'SlidingNumber must be mounted');
      return viewRef.current;
    });

    const prevNumberRef = useRef<number>(0);

    const effectiveNumber = useMemo(
      () => (startOnView && !inView ? 0 : Math.abs(Number(number))),
      [number, startOnView, inView],
    );

    const numberStr = effectiveNumber.toString();
    let [newIntStr] = numberStr.split('.');
    const [, newDecStr] = numberStr.split('.');
    newIntStr =
      padStart && newIntStr.length === 1 ? '0' + newIntStr : newIntStr;

    const prevStr = prevNumberRef.current.toString();
    let [prevIntStr = ''] = prevStr.split('.');
    const [, prevDecStr = ''] = prevStr.split('.');
    prevIntStr =
      padStart && prevIntStr.length === 1 ? '0' + prevIntStr : prevIntStr;

    const adjustedPrevInt = useMemo(() => {
      return prevIntStr.length > newIntStr.length
        ? prevIntStr.slice(-newIntStr.length)
        : prevIntStr.padStart(newIntStr.length, '0');
    }, [prevIntStr, newIntStr]);

    const adjustedPrevDec = useMemo(() => {
      if (!newDecStr) return '';
      return prevDecStr.length > newDecStr.length
        ? prevDecStr.slice(0, newDecStr.length)
        : prevDecStr.padEnd(newDecStr.length, '0');
    }, [prevDecStr, newDecStr]);

    useEffect(() => {
      if (!startOnView || inView) {
        prevNumberRef.current = effectiveNumber;
      }
    }, [effectiveNumber, inView, startOnView]);

    const intDigitCount = newIntStr.length;
    const intPlaces = useMemo(
      () =>
        Array.from({ length: intDigitCount }, (_, i) =>
          Math.pow(10, intDigitCount - i - 1),
        ),
      [intDigitCount],
    );
    const decPlaces = useMemo(
      () =>
        newDecStr
          ? Array.from({ length: newDecStr.length }, (_, i) =>
              Math.pow(10, newDecStr.length - i - 1),
            )
          : [],
      [newDecStr],
    );

    const newDecValue = newDecStr ? parseInt(newDecStr, 10) : 0;
    const prevDecValue = adjustedPrevDec ? parseInt(adjustedPrevDec, 10) : 0;

    return (
      <span
        ref={viewRef}
        className={twMerge('flex items-center', className)}
        {...props}
      >
        {!(startOnView && !inView) && Number(number) < 0 && <span>-</span>}

        {intPlaces.map((place, index) => (
          <Fragment key={`int-${place}`}>
            <NumberRoller
              prevValue={parseInt(adjustedPrevInt, 10)}
              value={parseInt(newIntStr, 10)}
              place={place}
              transition={transition}
            />
            {place !== 1 &&
              (intDigitCount - index - 1) % 3 === 0 &&
              index < intDigitCount - 1 && <span>{thousandSeparator}</span>}
          </Fragment>
        ))}

        {newDecStr && (
          <>
            <span>{decimalSeparator}</span>
            {decPlaces.map((place) => (
              <NumberRoller
                key={`dec-${place}`}
                prevValue={prevDecValue}
                value={newDecValue}
                place={place}
                transition={transition}
              />
            ))}
          </>
        )}
      </span>
    );
  },
);

SlidingNumber.displayName = 'SlidingNumber';

export { SlidingNumber };
