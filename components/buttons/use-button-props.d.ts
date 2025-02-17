import { AriaButtonProps, UseButtonPropsMetadata, UseButtonPropsOptions } from './types';
export declare function isTrivialHref(href?: string): boolean;
export declare function useButtonProps({ href, isDisabled, onClick, rel, role, tabIndex, tagName, target, type, }: UseButtonPropsOptions): [AriaButtonProps, UseButtonPropsMetadata];
