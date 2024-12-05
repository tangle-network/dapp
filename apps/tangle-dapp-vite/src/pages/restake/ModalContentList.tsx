import { Cross1Icon } from '@radix-ui/react-icons';
import { Search } from '@webb-tools/icons/Search';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { ListCardWrapper } from '@webb-tools/webb-ui-components/components/ListCard/ListCardWrapper';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import forwardRef from '@webb-tools/webb-ui-components/utils/forwardRef';
import isFunction from 'lodash/isFunction';
import {
  type ComponentProps,
  type ForwardedRef,
  type ReactNode,
  useMemo,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

type Props<ItemType> = Partial<ComponentProps<typeof ListCardWrapper>> & {
  title: string;
  items?: ItemType[];
  hasResetButton?: boolean;
  overrideResetButtonProps?: Partial<ComponentProps<typeof Button>>;
  overrideSearchInputProps?: ComponentProps<typeof Input>;
  searchFilter?: (item: ItemType, searchText: string) => boolean;
  renderEmpty?:
    | (() => ReactNode)
    | {
        title: string;
        description: string;
      };
  renderItem?: (operator: ItemType, index: number) => ReactNode;
};

const ModalContentList = forwardRef(
  <ItemType,>(
    {
      onClose,
      overrideTitleProps,
      items = [],
      hasResetButton,
      overrideResetButtonProps,
      overrideSearchInputProps,
      searchFilter,
      renderEmpty,
      renderItem,
      ...props
    }: Props<ItemType>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [searchText, setSearchText] = useState('');

    const isEmpty = Object.keys(items).length === 0;

    const filteredItems = useMemo(() => {
      if (searchText === '' || typeof searchFilter !== 'function') return items;

      return items.filter((item) => searchFilter(item, searchText));
    }, [items, searchFilter, searchText]);

    return (
      <ListCardWrapper
        {...props}
        className={twMerge('h-full', props.className)}
        onClose={onClose}
        ref={ref}
      >
        {!isEmpty && (
          <>
            {isFunction(searchFilter) && (
              <div className="py-4">
                <Input
                  id="search-modal-content"
                  rightIcon={<Search />}
                  isControlled
                  value={searchText}
                  onChange={(val) => setSearchText(val.toString())}
                  {...overrideSearchInputProps}
                />
              </div>
            )}

            <ScrollArea className={twMerge('h-full py-2')}>
              <ul>
                {filteredItems.map((current, idx) =>
                  renderItem?.(current, idx),
                )}
              </ul>
            </ScrollArea>

            {hasResetButton && (
              <Button
                leftIcon={<Cross1Icon />}
                isFullWidth
                {...overrideResetButtonProps}
                className={twMerge(
                  'mt-auto',
                  overrideResetButtonProps?.className,
                )}
              >
                {overrideResetButtonProps?.children || 'Clear Selection'}
              </Button>
            )}
          </>
        )}

        {isEmpty &&
          (isFunction(renderEmpty)
            ? renderEmpty()
            : typeof renderEmpty === 'object' && (
                <div className="flex flex-col items-center justify-center space-y-4 grow">
                  <Typography variant="h5" fw="bold" ta="center">
                    {renderEmpty.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    fw="semibold"
                    className="max-w-xs mt-1 text-mono-100 dark:text-mono-80"
                    ta="center"
                  >
                    {renderEmpty.description}
                  </Typography>
                </div>
              ))}
      </ListCardWrapper>
    );
  },
);

export default ModalContentList;
