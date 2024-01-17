import { Search } from '@webb-tools/icons';
import { Input } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import assert from 'assert';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { RelativePageUrl, SearchParamKey, validateSearchQuery } from '../utils';

export type SearchInputProps = PropsOf<typeof Input> & {
  isFullWidth?: boolean;

  /**
   * The homepage variant of the search input only differs
   * in visual style, not functionality.
   */
  isHomepageVariant?: boolean;

  /**
   * If `true`, the search input will redirect to the search page
   * when the value is changed, and after the debounce time.
   */
  doesRedirectOnChange?: boolean;

  /**
   * The handler to call when the value of the input changes.
   *
   * This is required if `doesRedirect` is `false`, otherwise the
   * input would be uncontrolled and have no purpose.
   */
  onValueChange?: (value: string) => void;
};

const DEFAULT_DEBOUNCE_DELAY = 1500;

const SearchInput: FC<SearchInputProps> = ({
  isFullWidth,
  isHomepageVariant,
  debounceTime = DEFAULT_DEBOUNCE_DELAY,
  doesRedirectOnChange: doesRedirect,
  className,
  inputClassName,
  onValueChange,
  ...rest
}) => {
  if (onValueChange === undefined) {
    assert(
      doesRedirect,
      "a value change handler is required if the input doesn't redirect, otherwise the input will be uncontrolled"
    );
  }

  const [searchQuery, setSearchQuery] = useQueryState(
    SearchParamKey.SearchQuery
  );

  const breakpoint = useTailwindBreakpoint();
  const router = useRouter();

  // TODO: Update constraints to match the search query, and re-fetch from API.
  const handleSearchQueryChange = (newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);

    // Only update the URL search param if the input will not
    // eventually redirect to the search page.
    if (doesRedirect && validateSearchQuery(newSearchQuery)) {
      const searchPageUrl = new URL(
        RelativePageUrl.Home,
        window.location.origin
      );

      // Attach the search query to the search page URL.
      searchPageUrl.searchParams.set(
        SearchParamKey.SearchQuery,
        newSearchQuery
      );

      router.push(searchPageUrl.href);
    } else {
      setSearchQuery(newSearchQuery);

      if (onValueChange !== undefined) {
        onValueChange(newSearchQuery);
      }
    }
  };

  const searchQueryPlaceholder = useMemo(
    () =>
      breakpoint >= TailwindBreakpoint.SM && isFullWidth && isHomepageVariant
        ? 'Search projects and circuits for specific keywords...'
        : 'Search projects and circuits...',
    [breakpoint, isFullWidth, isHomepageVariant]
  );

  const variantClass = useMemo(
    () =>
      isHomepageVariant ? 'rounded-[50px] border-none' : 'min-w-[270px] w-full',
    [isHomepageVariant]
  );

  const iconHomepageVariantClass = useMemo(
    () => (isHomepageVariant ? 'mr-4' : undefined),
    [isHomepageVariant]
  );

  return (
    <Input
      {...rest}
      rightIcon={<Search size="lg" className={iconHomepageVariantClass} />}
      inputClassName={twMerge(variantClass, inputClassName)}
      className={twMerge('flex-grow', className)}
      placeholder={searchQueryPlaceholder}
      value={searchQuery ?? ''}
      debounceTime={DEFAULT_DEBOUNCE_DELAY}
      onChange={handleSearchQueryChange}
    />
  );
};

export default SearchInput;
