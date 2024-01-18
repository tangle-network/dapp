export type FilterOptionItem = {
  label: string;
  amount: number;
};

export type FilterCategoryItem = {
  category: string;
  options: FilterOptionItem[];
};

export type FilterConstraints = Record<string, string[]>;
