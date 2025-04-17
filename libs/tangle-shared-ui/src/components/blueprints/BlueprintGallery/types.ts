import type { RowSelectionState } from '@tanstack/table-core';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';

export type BlueprintItemProps = {
  id: bigint;
  name: string;
  author: string;
  imgUrl: string | null;
  description: string | null;
  restakersCount: number | null;
  operatorsCount: number | null;
  tvl: string | null;
  isBoosted?: boolean;
  category: string | null;
  renderImage: (imageUrl: string) => React.ReactNode;
  isSelected?: boolean;
  onSelectedChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export type BlueprintGalleryProps = {
  blueprints: BlueprintItemProps[];
  isLoading: boolean;
  error: Error | null;
  BlueprintItemWrapper?: React.FC<
    PropsWithChildren<Omit<BlueprintItemProps, 'renderImage'>>
  >;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: Dispatch<SetStateAction<RowSelectionState>>;
};
