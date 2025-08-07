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
      {title: 'Quickstart', href: '/quickstart'},
      {
        title: 'Add to Existing Project',
        href: '/add-to-existing-project',
      },
      {title: 'Samples', href: '/samples'},
      {title: 'Status', href: '/status'},
    ],
  },

  {
    title: 'Learning Zero',
    href: null,
    items: [
      {title: 'What is Sync?', href: '/sync'},
      {title: 'When to Use', href: '/when-to-use'},
      {title: 'Roadmap', href: '/roadmap'},
    ],
  },

  {
    title: 'Using Zero',
    href: null,
    items: [
      //TODO
      //{title: 'How Zero Works', href: '/overview'},
      {title: 'Schema', href: '/zero-schema'},
      {title: 'Reading Data (ZQL)', href: '/reading-data'},
      {
        title: 'Writing Data (Mutators)',
        href: '/writing-data',
      },
      {
        title: 'Custom Mutators',
        href: '/custom-mutators',
      },
      {title: 'Authentication', href: '/auth'},
      {title: 'Permissions', href: '/permissions'},
      {title: 'Sharing ZQL', href: '/zql-on-the-server'},
      {title: 'Offline', href: '/offline'},
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
      {title: 'Community', href: '/community'},
    ],
  },

  {
    title: 'Deployment',
    href: null,
    defaultOpen: false,
    items: [
      {title: 'Overview', href: '/deployment'},
      {title: 'Runtime Config', href: '/zero-cache-config'},
    ],
  },

  {
    title: 'Debugging',
    href: null,
    defaultOpen: false,
    items: [
      {title: 'Inspector API', href: '/debug/inspector'},
      {
        title: 'Permissions',
        href: '/debug/permissions',
      },
      {title: 'Slow Queries', href: '/debug/slow-queries'},
      {title: 'Replication', href: '/debug/replication'},
      {title: 'Query ASTs', href: '/debug/query-asts'},
      {title: 'OpenTelemetry', href: '/debug/otel'},
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
