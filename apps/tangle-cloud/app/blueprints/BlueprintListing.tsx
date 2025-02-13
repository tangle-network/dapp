'use client';

import { RowSelectionState } from '@tanstack/table-core';
import BlueprintGallery from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useBlueprintListing from '@tangle-network/tangle-shared-ui/data/blueprints/useBlueprintListing';
import Image from 'next/image';
import Link from 'next/link';
import {
  ComponentProps,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useMemo,
} from 'react';
import { PagePath } from '../../types';

const BlueprintItemWrapper = ({
  children,
  id,
}: PropsWithChildren<{ id: string }>) => {
  return <Link href={`${PagePath.BLUEPRINTS}/${id}`}>{children}</Link>;
};

type Props = {
  rowSelection: RowSelectionState;
  onRowSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
} & ReturnType<typeof useBlueprintListing>;

const BlueprintListing: FC<Props> = ({
  rowSelection,
  onRowSelectionChange,
  blueprints,
  isLoading,
  error,
}) => {
  const blueprintsDisplay = useMemo<
    ComponentProps<typeof BlueprintGallery>['blueprints']
  >(() => {
    return Object.values(blueprints).map((blueprint) => ({
      ...blueprint,
      renderImage(imageUrl) {
        return (
          <Image
            src={imageUrl}
            width={72}
            height={72}
            alt={blueprint.name}
            className="flex-shrink-0 bg-center rounded-full"
            fill={false}
          />
        );
      },
    }));
  }, [blueprints]);

  return (
    <BlueprintGallery
      blueprints={blueprintsDisplay}
      isLoading={isLoading}
      error={error}
      BlueprintItemWrapper={BlueprintItemWrapper}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
    />
  );
};

BlueprintListing.displayName = 'BlueprintListing';

export default BlueprintListing;
