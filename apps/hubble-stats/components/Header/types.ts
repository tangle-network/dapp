export type Breadcrumb = {
  label: string;
  isLast: boolean;
  icon: JSX.Element;
  href: string;
  className?: string;
};

export type HeaderProps = {
  tvlValue: string;
  volumeValue: string;
};
