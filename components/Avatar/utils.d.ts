import { AvatarProps } from './types';
/**
 * Get the avatar size in pixel for other avatar components to consistent with Avatar component
 * @param size The `Avatar` size component
 * @returns the size in pixel for other avatar components
 */
export declare function getAvatarSizeInPx(size?: AvatarProps['size']): 16 | 24 | 48;
export declare const getAvatarClassNames: (darkMode: boolean | undefined) => {
    borderColor: "border-mono-140" | "border-mono-60" | "border-mono-60 dark:border-mono-140";
    bg: "bg-mono-140" | "bg-mono-60" | "bg-mono-60 dark:bg-mono-140";
    text: "text-mono-60" | "text-mono-140" | "text-mono-140 dark:text-mono-60";
};
