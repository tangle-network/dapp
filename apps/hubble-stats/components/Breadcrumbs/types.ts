export type BreadcrumbsType = {
  className?: string;
};

export type BreadcrumbItemType = {
  label: string;
  isLast: boolean;
  icon: JSX.Element;
  href: string;
  className?: string;
};
