import useHiddenValue from '../hooks/useHiddenValue';

function HiddenValue(props: {
  /** The children must be a string */
  children: string;

  /** Number of star to display. @default 3 */
  numberOfStars?: number;
}) {
  const { numberOfStars = 3 } = props;

  const [isHidden] = useHiddenValue();

  if (isHidden) {
    return Array.from({ length: numberOfStars })
      .map(() => '*')
      .join('');
  }

  return props.children;
}

export default HiddenValue;
