import useMeasure from 'react-use-measure';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { StatusIndicator } from '@tangle-network/icons';
import { Chip, EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components';
import { Fragment, useEffect, useId, useMemo } from 'react';
import { useIndexingProgress } from '../queries';
import {
  motion,
  motionValue,
  MotionValue,
  Transition,
  useSpring,
  useTransform,
} from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export const SyncProgressIndicator = () => {
  const { data, error, isPending } = useIndexingProgress();

  const progress = useMemo(() => {
    if (!data?.lastProcessedHeight || !data?.targetHeight) {
      return 0;
    }

    // Round to 2 decimal places
    return (
      Math.round((data.lastProcessedHeight / data.targetHeight) * 100 * 100) /
      100
    );
  }, [data?.lastProcessedHeight, data?.targetHeight]);

  const isSynced = useMemo(() => {
    if (!data?.lastProcessedHeight || !data?.targetHeight) {
      return false;
    }

    return data.lastProcessedHeight === data.targetHeight;
  }, [data?.lastProcessedHeight, data?.targetHeight]);

  const displayContent = useMemo(() => {
    if (isPending) {
      return (
        <>
          <StatusIndicator variant="info" animated />
          Loading indexing status...
        </>
      );
    }

    if (error) {
      return (
        <>
          <CrossCircledIcon className="text-red-500" />
          Error loading indexing status
        </>
      );
    }

    return (
      <>
        <StatusIndicator
          variant={isSynced ? 'success' : 'info'}
          animated={!isSynced}
        />
        <span className="flex items-center">
          {isSynced ? 'Synced' : 'Indexing'}

          <span className="inline-block ml-1">
            {data?.lastProcessedHeight ? (
              <SlidingNumber value={data.lastProcessedHeight} />
            ) : (
              EMPTY_VALUE_PLACEHOLDER
            )}
          </span>

          <span className="inline-block ml-1">of</span>

          <span className="inline-block ml-1">
            {data?.targetHeight ? (
              <SlidingNumber value={data.targetHeight} />
            ) : (
              EMPTY_VALUE_PLACEHOLDER
            )}
          </span>

          <span className="items-center hidden sm:flex ml-1">
            (<SlidingNumber value={progress} />
            %)
          </span>
        </span>
      </>
    );
  }, [
    isPending,
    error,
    isSynced,
    data?.lastProcessedHeight,
    data?.targetHeight,
    progress,
  ]);

  return (
    <Chip
      color={error ? 'red' : 'dark-grey'}
      className="!bg-opacity-50 normal-case"
    >
      {displayContent}
    </Chip>
  );
};

const TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 18,
  mass: 0.3,
} as const satisfies Transition;

function Number({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const uniqueId = useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * bounds.height;

    if (offset > 5) {
      memo -= 10 * bounds.height;
    }

    return memo;
  });

  // don't render the animated number until we know the height
  if (!bounds.height) {
    return (
      <span ref={ref} className="invisible absolute">
        {number}
      </span>
    );
  }

  return (
    <motion.span
      style={{ y }}
      layoutId={`${uniqueId}-${number}`}
      className="absolute inset-0 flex items-center justify-center"
      transition={TRANSITION}
      ref={ref}
    >
      {number}
    </motion.span>
  );
}

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  thousandSeparator?: string;
  className?: string;
};

function Digit({ value, place }: { value: number; place: number }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = motionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, TRANSITION);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div className="relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none">
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = '.',
  thousandSeparator = ',',
  className,
}: SlidingNumberProps) {
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toString().split('.');
  const integerValue = parseInt(integerPart, 10);
  const paddedInteger =
    padStart && integerValue < 10 ? `0${integerPart}` : integerPart;
  const integerDigits = paddedInteger.split('');
  const integerPlaces = integerDigits.map((_, i) =>
    Math.pow(10, integerDigits.length - i - 1),
  );

  return (
    <div className={twMerge('flex items-center', className)}>
      {value < 0 && '-'}
      {integerDigits.map((_, index) => {
        // Add comma separator every 3 digits from the right
        const needsComma =
          index > 0 && (integerDigits.length - index) % 3 === 0;

        return (
          <Fragment key={`pos-${integerPlaces[index]}`}>
            {needsComma && <span>{thousandSeparator}</span>}
            <Digit value={integerValue} place={integerPlaces[index]} />
          </Fragment>
        );
      })}
      {decimalPart && (
        <>
          <span>{decimalSeparator}</span>
          {decimalPart.split('').map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={parseInt(decimalPart, 10)}
              place={Math.pow(10, decimalPart.length - index - 1)}
            />
          ))}
        </>
      )}
    </div>
  );
}
