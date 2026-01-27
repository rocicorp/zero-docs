export type SearchHeading = {text: string; id: string};

export type SearchDocument = {
  id: string;
  title: string;
  searchTitle: string;
  content: string;
  url: string;
  kind: 'page' | 'section';
  sectionTitle?: string;
  sectionId?: string;
  headings?: SearchHeading[];
  icon?: string;
};
