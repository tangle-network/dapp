import useHiddenValue from '../hooks/useHiddenValue';

function HiddenValue(props: {
  /** The children must be a string */
  children: string;

  /** Number of star to display. @default to children.length */
  numberOfStars?: number;
}) {
  const { numberOfStars } = props;

  const [isHidden] = useHiddenValue();

  if (isHidden) {
    return Array.from({ length: numberOfStars ?? props.children.length })
      .map(() => '*')
      .join('');
  }

  return props.children;
}

export default HiddenValue;
