import { SliderProps } from './types';
/**
 * The `Slider` component
 *
 * Props:
 *
 * - `defaultValue`: The value of the slider when initially rendered. Use when you do not need to control the state of the slider.
 * - `value`: The controlled value of the slider. Must be used in conjunction with `onChange`.
 * - `onChange`: Event handler called when the value changes.
 * - `minStepsBetweenThumbs`: The minimum permitted steps between multiple.
 * - `name`: The name of the slider. Submitted with its owning form as part of a name/value pair.
 * - `isDisabled`: When true, prevents the user from interacting with the slider.
 * - `min`: The minimum value for the range.
 * - `max`: The maximum value for the range
 * - `step`: The stepping interval.
 *
 * ```jsx
 *  <Slider className='mt-4' defaultValue={[25]} />
 *  <Slider className='mt-4' hasLabel defaultValue={[25]} />
 *  <Slider className='mt-4' value={sliderVal} onChange={setSliderVal} />
 *  <Slider className='mt-4' hasLabel defaultValue={[25, 75]} />
 * ```
 */
export declare const Slider: import('../../../../../node_modules/react').ForwardRefExoticComponent<SliderProps & import('../../../../../node_modules/react').RefAttributes<HTMLSpanElement>>;
