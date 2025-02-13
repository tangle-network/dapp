import { Search } from '@tangle-network/icons';
import {
  Input,
  ListItem,
  ListStatus,
  Modal,
  ModalContent,
  ModalHeader,
} from '@tangle-network/webb-ui-components';
import { useMemo, useState } from 'react';
import SkeletonRows from './SkeletonRows';
import { twMerge } from 'tailwind-merge';
import { ScrollArea } from '@radix-ui/react-scroll-area';

export type ListModalProps<T> = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  showSearch?: boolean;
  searchInputId: string;
  searchPlaceholder: string;
  titleWhenEmpty: string;
  descriptionWhenEmpty: string;
  renderItem: (item: T) => JSX.Element | null;
  getItemKey?: (item: T) => string;
  onSelect: (item: T) => void;
  sorting?: (a: T, b: T) => number;
  isLoading?: boolean;

  /**
   * Provide a function to help determine whether to include an item in the list once a search query is provided.
   *
   * If not defined, the search input will not be displayed because it cannot be determined how to filter the items.
   */
  filterItem?: (item: T, searchQuery: string) => boolean;

  /**
   * The items to display in the list.
   *
   * If `null`, `undefined`, or `false`, the list will display a loading state.
   */
  items: T[] | null | undefined | false | Error;
};

const ListModal = <T,>({
  title,
  isOpen,
  setIsOpen,
  filterItem,
  sorting,
  titleWhenEmpty,
  descriptionWhenEmpty,
  showSearch = true,
  searchPlaceholder,
  searchInputId,
  items,
  renderItem,
  getItemKey,
  onSelect,
  isLoading: isLoadingProp,
}: ListModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const isSearching = searchQuery.trim().length > 0;

  const sortedItems = useMemo(() => {
    if (!Array.isArray(items) || sorting === undefined) {
      return items;
    }

    return items.toSorted(sorting);
  }, [items, sorting]);

  const processedItems = useMemo(() => {
    if (
      !isSearching ||
      filterItem === undefined ||
      !Array.isArray(sortedItems)
    ) {
      return sortedItems;
    }

    return sortedItems.filter((item) => filterItem(item, searchQuery));
  }, [filterItem, isSearching, sortedItems, searchQuery]);

  const isLoading = !Array.isArray(processedItems) || isLoadingProp;
  const isEmpty = !isSearching && !isLoading && processedItems.length === 0;

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent
        size="md"
        className={twMerge(
          'max-h-[600px]',
          Array.isArray(processedItems) &&
            processedItems.length > 0 &&
            'h-full',
        )}
      >
        <ModalHeader className="pb-4">{title}</ModalHeader>

        <div>
          {showSearch && filterItem !== undefined && !isEmpty && !isLoading && (
            <div className="px-4 pb-4 md:px-9">
              <Input
                id={searchInputId}
                isControlled
                rightIcon={<Search className="mr-2" />}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={setSearchQuery}
                inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
              />
            </div>
          )}

          <hr className="w-full border-b border-mono-40 dark:border-mono-170" />

          {items instanceof Error ? (
            <ListStatus
              emoji="⚠️"
              title="Unable to Display Items"
              description={`There was an error while attempting to load the items: ${items.message}`}
              className="px-8 py-14"
            />
          ) : isLoading ? (
            <div className="p-8">
              <SkeletonRows rowCount={7} className="h-[40px]" />
            </div>
          ) : isEmpty ? (
            <ListStatus
              title={titleWhenEmpty}
              description={descriptionWhenEmpty}
              className="px-8 py-14"
            />
          ) : isSearching && processedItems.length === 0 ? (
            <ListStatus
              title="Nothing Found"
              description="No items found matching your search query."
              className="px-8 py-14"
            />
          ) : (
            <ScrollArea className="w-full h-full pt-4">
              <ul>
                {/** TODO: Handle edge case where all processed items are omitted by returning null, and thus the list is actually empty. */}
                {processedItems.map((item, index) => {
                  const key =
                    getItemKey !== undefined
                      ? getItemKey(item)
                      : index.toString();

                  const itemContent = renderItem(item);

                  // Ignore the item if the render function returns `null`.
                  if (itemContent === null) {
                    return null;
                  }

                  return (
                    <ListItem
                      key={key}
                      onClick={() => onSelect(item)}
                      className="w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-3 cursor-pointer"
                    >
                      {itemContent}
                    </ListItem>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ListModal;
