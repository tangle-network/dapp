'use client';

import { RowSelectionState } from '@tanstack/table-core';
import BlueprintGallery from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useFakeBlueprintListing from '@webb-tools/tangle-shared-ui/data/blueprints/useFakeBlueprintListing';
import Image from 'next/image';
import Link from 'next/link';
import {
  ComponentProps,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import { PagePath } from '../../types';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import SelectionBar from './SelectionBar';
import { ArrowRight } from '@webb-tools/icons';

const BlueprintItemWrapper = ({
  children,
  id,
}: PropsWithChildren<{ id: string }>) => {
  return <Link href={`${PagePath.BLUEPRINTS}/${id}`}>{children}</Link>;
};

type Props = {
  rowSelection: RowSelectionState;
  onRowSelectionChange: Dispatch<SetStateAction<RowSelectionState>>;
} & ReturnType<typeof useFakeBlueprintListing>;

const BlueprintListing: FC<Props> = ({
  rowSelection,
  onRowSelectionChange,
}) => {
  const { blueprints, isLoading, error } = useFakeBlueprintListing();
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

  const selectedCount = Object.keys(rowSelection).length;

  const handleClear = () => {
    onRowSelectionChange({});
  };

  const handleRegister = () => {
    // TODO: Implement registration logic
    console.log('Selected blueprints:', rowSelection);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="utility"
          size="sm"
          onClick={() => setIsSelectionMode(true)}
          rightIcon={<ArrowRight className="!fill-current" />}
        >
          Register
        </Button>
      </div>

      <BlueprintGallery
        blueprints={blueprintsDisplay}
        isLoading={isLoading}
        error={error}
        BlueprintItemWrapper={!isSelectionMode ? BlueprintItemWrapper : undefined}
        rowSelection={isSelectionMode ? rowSelection : undefined}
        onRowSelectionChange={isSelectionMode ? onRowSelectionChange : undefined}
      />

      {isSelectionMode && selectedCount > 0 && (
        <SelectionBar
          selectedCount={selectedCount}
          onClear={handleClear}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};

BlueprintListing.displayName = 'BlueprintListing';

export default BlueprintListing;
