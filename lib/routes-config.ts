// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string | null;
  new?: boolean;
  items?: EachRoute[];
  defaultOpen?: boolean;
};

export const ROUTES = [
  {
    title: 'Get Started',
    href: null,
    new: false,
    items: [
      {title: 'Introduction', href: '/introduction'},
      {title: 'Installation', href: '/install'},
      {title: 'Quickstart', href: '/quickstart'},
      {title: 'Samples', href: '/samples'},
    ],
  },

  {
    title: 'Learning Zero',
    href: null,
    items: [
      {title: 'What is Sync?', href: '/sync'},
      //{title: 'How Zero Works', href: '/design'},
      {title: 'When to Use', href: '/when-to-use'},
      {title: 'Status', href: '/status'},
    ],
  },

  {
    title: 'Using Zero',
    href: null,
    items: [
      {title: 'Schema', href: '/schema'},
      {title: 'Authentication', href: '/auth'},
      {title: 'Reading Data', href: '/queries'},
      {title: 'Writing Data', href: '/mutators'},
      {title: 'ZQL Reference', href: '/zql'},
      {title: 'ZQL on the Server', href: '/server-zql'},
      {title: 'Connection Status', href: '/connection'},
    ],
  },

  {
    title: 'Postgres',
    href: null,
    defaultOpen: false,
    items: [
      {
        title: 'Provider Support',
        href: '/connecting-to-postgres',
      },
      {
        title: 'Feature Compatibility',
        href: '/postgres-support',
      },
    ],
  },

  {
    title: 'Integrations',
    href: null,
    defaultOpen: false,
    items: [
      {title: 'React', href: '/react'},
      {title: 'SolidJS', href: '/solidjs'},
      {title: 'React Native', href: '/react-native'},
      {title: 'Community', href: '/community'},
    ],
  },

  {
    title: 'Deployment',
    href: null,
    defaultOpen: false,
    items: [
      {title: 'Hosting', href: '/deployment'},
      {title: 'Configuration', href: '/zero-cache-config'},
    ],
  },

  {
    title: 'Debugging',
    href: null,
    defaultOpen: false,
    items: [
      {title: 'Inspector', href: '/debug/inspector'},
      {title: 'Slow Queries', href: '/debug/slow-queries'},
      {title: 'Replication', href: '/debug/replication'},
      {title: 'Query ASTs', href: '/debug/query-asts'},
      {title: 'OpenTelemetry', href: '/debug/otel'},
      {title: 'zero-out', href: '/debug/zero-out'},
    ],
  },

  {
    title: 'Old Stuff',
    href: null,
    items: [
      {title: 'Ad-Hoc Queries', href: '/deprecated/ad-hoc-queries'},
      {title: 'CRUD Mutators', href: '/deprecated/crud-mutators'},
      {title: 'RLS Permissions', href: '/deprecated/rls-permissions'},
    ],
  },

  {
    title: 'Meta',
    href: null,
    defaultOpen: false,
    items: [
      {title: 'Release Notes', href: '/release-notes'},
      {title: 'Reporting Bugs', href: '/reporting-bugs'},
      {title: 'Open Source', href: '/open-source'},
      {title: 'LLMs', href: '/llms'},
    ],
  },
] as const satisfies EachRoute[];

type Page = {title: string; href: string};

function getRecursiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (node.href) {
    ans.push({title: node.title, href: node.href});
  }
  node.items?.forEach(subNode => {
    const temp = {...subNode, href: `${node.href ?? ''}${subNode.href ?? ''}`};
    ans.push(...getRecursiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map(it => getRecursiveAllLinks(it)).flat();
