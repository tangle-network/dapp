import { AriaButtonProps, UseButtonPropsMetadata, UseButtonPropsOptions } from './types';

export function isTrivialHref(href?: string) {
  return !href || href.trim() === '#';
}

export function useButtonProps({
  href,
  isDisabled,
  onClick,
  rel,
  role,
  tabIndex = 0,
  tagName,
  target,
  type,
}: UseButtonPropsOptions): [AriaButtonProps, UseButtonPropsMetadata] {
  if (!tagName) {
    if (href != null || target != null || rel != null) {
      tagName = 'a';
    } else {
      tagName = 'button';
    }
  }

  const meta: UseButtonPropsMetadata = { tagName };
  if (tagName === 'button') {
    return [{ type: (type as any) || 'button', disabled: isDisabled }, meta];
  }

  const handleClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (isDisabled || (tagName === 'a' && isTrivialHref(href))) {
      event.preventDefault();
    }

    if (isDisabled) {
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  if (tagName === 'a') {
    // Ensure there's a href so Enter can trigger anchor button.
    href ||= '#';
    if (isDisabled) {
      href = undefined;
    }
  }

  return [
    {
      role: role ?? 'button',
      // explicitly undefined so that it overrides the props disabled in a spread
      // e.g. <Tag {...props} {...hookProps} />
      disabled: undefined,
      tabIndex: isDisabled ? undefined : tabIndex,
      href,
      target: tagName === 'a' ? target : undefined,
      'aria-disabled': !isDisabled ? undefined : isDisabled,
      rel: tagName === 'a' ? rel : undefined,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    },
    meta,
  ];
}
