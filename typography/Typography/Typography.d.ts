import { TypographyProps } from '../types';
/**
 * The Typography component
 *
 * Props:
 * - `variant`: Represent different variants of the component
 * - `component`: The html tag (default: same as `variant` prop)
 * - `fw`: Represent the **font weight** of the component (default: `normal`)
 * - `ta`: Text align (default: `left`)
 * - `darkMode`: Control component dark mode display in `js`, leave it's empty if you want to control dark mode in `css`
 *
 * @example
 *
 * ```jsx
 * <Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>
 * <Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>
 * ```
 */
export declare const Typography: React.FC<TypographyProps>;
