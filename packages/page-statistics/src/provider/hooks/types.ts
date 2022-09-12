export type Page<T> = {
  items: T[];
  pageInfo: {
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
export type Loadable<T> = {
  val: T | null;
  isLoading: boolean;
  isFailed: boolean;
  failed?: string;
};
