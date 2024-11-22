export type BlueprintItemProps = {
  id: string;
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
};

export type BlueprintGalleryProps = {
  blueprints: BlueprintItemProps[];
  isLoading: boolean;
  error: Error | null;
  getBlueprintUrl?: (blueprint: BlueprintItemProps) => string;
};
