export interface DocsNavProps {
  navItems: any;
}

export interface NavTitleProps {
  level: number;
  selected: boolean;
  childSelected?: boolean;
  children: React.ReactNode | React.ReactNode[];
  onClick?: () => void;
}
