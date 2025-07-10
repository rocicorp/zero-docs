// for page navigation & to sort on leftbar

import {IconKey} from './icons';

export type EachRoute = {
  title: string;
  href: string | null;
  new?: boolean;
  items?: EachRoute[];
  defaultOpen?: boolean;
  icon: IconKey;
};

export const ROUTES = [
  {
    title: 'Welcome',
    href: null,
    new: false,
    icon: 'Terminal',
    items: [
      {title: 'Introduction', href: '/introduction', icon: 'BookOpen'},
      {title: 'Quickstart', href: '/quickstart', icon: 'CirclePlay'},
      {
        title: 'Add to Existing Project',
        href: '/add-to-existing-project',
        icon: 'Plus',
      },
      {title: 'Samples', href: '/samples', icon: 'SwatchBook'},
    ],
  },

  {
    title: 'Postgres',
    href: null,
    defaultOpen: true,
    icon: 'Database',
    items: [
      {
        title: 'Provider Support',
        href: '/connecting-to-postgres',
        icon: 'Cable',
      },
      {
        title: 'Feature Compatibility',
        href: '/postgres-support',
        icon: 'Blend',
      },
    ],
  },

  {
    title: 'Concepts',
    href: null,
    icon: 'Eclipse',
    items: [
      //TODO
      //{title: 'How Zero Works', href: '/overview'},
      {title: 'Schema', href: '/zero-schema', icon: 'Blocks'},
      {title: 'Reading Data (ZQL)', href: '/reading-data', icon: 'ArrowDown'},
      {
        title: 'Writing Data (Mutators)',
        href: '/writing-data',
        icon: 'ArrowUp',
      },
      {
        title: 'Custom Mutators',
        href: '/custom-mutators',
        icon: 'ArrowUpWideNarrow',
      },
      {title: 'Authentication', href: '/auth', icon: 'KeyRound'},
      {title: 'Permissions', href: '/permissions', icon: 'ShieldCheck'},
      {title: 'Sharing ZQL', href: '/zql-on-the-server', icon: 'Share2'},
      {title: 'Offline', href: '/offline', icon: 'Unplug'},
    ],
  },

  {
    title: 'Integrations',
    href: null,
    defaultOpen: false,
    icon: 'Link2',
    items: [
      {title: 'React', href: '/react', icon: 'React'},
      {title: 'SolidJS', href: '/solidjs', icon: 'SolidJS'},
      {title: 'Community', href: '/community', icon: 'Users2'},
    ],
  },

  {
    title: 'Deployment',
    href: null,
    defaultOpen: false,
    icon: 'CircleFadingArrowUp',
    items: [
      {title: 'Overview', href: '/deployment', icon: 'Server'},
      {title: 'Runtime Config', href: '/zero-cache-config', icon: 'Cog'},
    ],
  },

  {
    title: 'Debugging',
    href: null,
    defaultOpen: false,
    icon: 'Code2',
    items: [
      {title: 'Inspector API', href: '/debug/inspector', icon: 'SearchIcon'},
      {
        title: 'Permissions',
        href: '/debug/permissions',
        icon: 'ShieldQuestion',
      },
      {title: 'Slow Queries', href: '/debug/slow-queries', icon: 'Clock'},
      {title: 'Replication', href: '/debug/replication', icon: 'CopyIcon'},
      {title: 'Query ASTs', href: '/debug/query-asts', icon: 'Workflow'},
      {title: 'OpenTelemetry', href: '/debug/otel', icon: 'ChartLine'},
    ],
  },

  {
    title: 'Meta',
    href: null,
    defaultOpen: false,
    icon: 'Puzzle',
    items: [
      {title: 'Roadmap', href: '/roadmap', icon: 'Map'},
      {title: 'Release Notes', href: '/release-notes', icon: 'RefreshCcw'},
      {title: 'Reporting Bugs', href: '/reporting-bugs', icon: 'BadgeAlert'},
      {title: 'Open Source', href: '/open-source', icon: 'CircleDashed'},
      {title: 'LLMs', href: '/llms', icon: 'Sparkle'},
    ],
  },
] as const satisfies EachRoute[];

type Page = {title: string; href: string; icon: IconKey};

function getRecursiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (node.href) {
    ans.push({title: node.title, href: node.href, icon: node.icon});
  }
  node.items?.forEach(subNode => {
    const temp = {...subNode, href: `${node.href ?? ''}${subNode.href ?? ''}`};
    ans.push(...getRecursiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map(it => getRecursiveAllLinks(it)).flat();
