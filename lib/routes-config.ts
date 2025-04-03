// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true;
  new?: boolean;
  items?: EachRoute[];
};

export const ROUTES: EachRoute[] = [
  {
    title: 'Welcome',
    href: '',
    noLink: true,
    new: false,
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
      //TODO
      //{title: 'How Zero Works', href: '/overview'},
      {title: 'Connecting to Postgres', href: '/connecting-to-postgres'},
      {title: 'Supported Postgres Features', href: '/postgres-support'},
      {title: 'Zero Schema', href: '/zero-schema'},
      {title: 'Reading Data with ZQL', href: '/reading-data'},
      {title: 'Writing Data with Mutators', href: '/writing-data'},
      {title: 'Custom Mutators', href: '/custom-mutators', new: true},
      {title: 'Authentication', href: '/auth'},
      {title: 'Permissions', href: '/permissions'},
      {title: 'Deployment', href: '/deployment'},
      {title: '`zero-cache` Config', href: '/zero-cache-config'},
    ],
  },

  {
    title: 'Integrations',
    href: '',
    noLink: true,
    items: [
      {title: 'React', href: '/react'},
      {title: 'SolidJS', href: '/solidjs'},
      {title: 'Community', href: '/community'},
    ],
  },

  {
    title: 'Debugging',
    href: '',
    noLink: true,
    items: [
      {title: 'Inspector API', href: '/debug/inspector'},
      {title: 'Slow Queries', href: '/debug/slow-queries'},
      {title: 'Permissions', href: '/debug/permissions'},
      {title: 'Replication', href: '/debug/replication'},
      {title: 'Query ASTs', href: '/debug/query-asts'},
    ],
  },

  {
    title: 'Meta',
    href: '',
    noLink: true,
    items: [
      {title: 'Roadmap', href: '/roadmap'},
      {title: 'Reporting Bugs', href: '/reporting-bugs'},
      {title: 'Release Notes', href: '/release-notes'},
      {title: 'Open Source', href: '/open-source'},
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
