// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true;
  items?: EachRoute[];
};

export const ROUTES: EachRoute[] = [
  {
    title: 'Welcome',
    href: '',
    noLink: true,
    items: [
      {title: 'Introduction', href: '/introduction'},
      {title: 'Quickstart', href: '/quickstart'},
      {title: 'Samples', href: '/samples'},
    ],
  },

  {
    title: 'Using Zero',
    href: '',
    noLink: true,
    items: [
      {title: 'How Zero Works', href: '/overview'},
      {title: 'Connecting to Postgres', href: '/connecting-to-postgres'},
      {title: 'Supported Postgres Features', href: '/postgres-support'},
      {title: 'Zero Schema', href: '/zero-schema'},
      {title: 'Reading Data with ZQL', href: '/reading-data'},
      {title: 'Writing Data with Mutators', href: '/writing-data'},
      {title: 'Authentication', href: '/auth'},
      {title: 'Permissions', href: '/permissions'},
      {title: 'Preloading', href: '/preloading'},
      {title: 'Schema Migrations', href: '/migrations'},
      {title: 'Deployment', href: '/deployment'},
      {title: '`zero-cache` Config', href: '/zero-cache-config'},
      {title: 'Recipes', href: '/recipes'},
    ],
  },

  {
    title: 'Integrations',
    href: '',
    noLink: true,
    items: [
      {title: 'React', href: '/react'},
      {title: 'SolidJS', href: '/solidjs'},
    ],
  },

  {
    title: 'Meta',
    href: '',
    noLink: true,
    items: [
      {title: 'Roadmap', href: '/roadmap'},
      {title: 'Reporting Bugs', href: '/reporting-bugs'},
      {
        title: 'Release Notes',
        href: '/release-notes',
        items: [
          {title: '0.1', href: '/0.1'},
          {title: '0.2', href: '/0.2'},
          {title: '0.3', href: '/0.3'},
          {title: '0.4', href: '/0.4'},
          {title: '0.5', href: '/0.5'},
          {title: '0.6', href: '/0.6'},
        ],
      },
    ],
  },
];

type Page = {title: string; href: string};

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({title: node.title, href: node.href});
  }
  node.items?.forEach(subNode => {
    const temp = {...subNode, href: `${node.href}${subNode.href}`};
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map(it => getRecurrsiveAllLinks(it)).flat();
