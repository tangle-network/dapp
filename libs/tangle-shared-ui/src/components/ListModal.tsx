import { Search } from '@webb-tools/icons';
import {
  Input,
  ListItem,
  ListStatus,
  Modal,
  ModalContent,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
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
  renderItem: (item: T) => JSX.Element;
  getItemKey?: (item: T) => string;
  onSelect: (item: T) => void;
  sorting?: (a: T, b: T) => number;

  /**
   * If not defined, the search input will not be displayed.
   */
  filterItems?: (item: T, searchQuery: string) => boolean;

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
  filterItems,
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
      filterItems === undefined ||
      !Array.isArray(sortedItems)
    ) {
      return sortedItems;
    }

    return sortedItems.filter((item) => filterItems(item, searchQuery));
  }, [filterItems, isSearching, sortedItems, searchQuery]);

  const isLoading = !Array.isArray(processedItems);
  const isEmpty = !isSearching && !isLoading && processedItems.length === 0;

  return (
    <Modal>
      <ModalContent
        isOpen={isOpen}
        onInteractOutside={() => setIsOpen(false)}
        size="md"
        className={twMerge(
          'max-h-[600px]',
          Array.isArray(processedItems) &&
            processedItems.length > 0 &&
            'h-full',
        )}
      >
        <ModalHeader className="pb-4" onClose={() => setIsOpen(false)}>
          {title}
        </ModalHeader>

        <div>
          {showSearch &&
            filterItems !== undefined &&
            !isEmpty &&
            !isLoading && (
              <div className="px-4 pb-4 md:px-9">
                <Input
                  id={searchInputId}
                  isControlled
                  rightIcon={<Search className="pr-2" />}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
                />
              </div>
            )}

          <hr className="w-full border-b border-mono-40 dark:border-mono-170" />

          {isLoading ? (
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
                {processedItems.map((item, index) => {
                  const key =
                    getItemKey !== undefined
                      ? getItemKey(item)
                      : index.toString();

                  return (
                    <ListItem
                      key={key}
                      onClick={() => onSelect(item)}
                      className="w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-3 cursor-pointer"
                    >
                      {renderItem(item)}
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
