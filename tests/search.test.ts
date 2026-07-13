import path from 'node:path';
import {beforeAll, describe, expect, it} from 'vitest';
import {createLunrIndex, searchDocuments} from '@/lib/search';
import {extractDocumentsFromMDX} from '@/lib/generateSearchIndex';
import {getAllMDXFiles} from '@/lib/get-slugs';
import type {SearchDocument} from '@/lib/search-types';

const getDocPath = (slug: string) =>
  path.join(process.cwd(), 'contents', 'docs', `${slug}.mdx`);

const getAllDocPaths = () =>
  getAllMDXFiles(path.join(process.cwd(), 'contents', 'docs')).sort();

const loadAllSearchDocuments = async () =>
  (
    await Promise.all(
      getAllDocPaths().map(file => extractDocumentsFromMDX(file)),
    )
  ).flat();

type CommonSearchCase = {
  query: string;
  expectedTopUrl?: string;
  expectedTopComposedUrl?: string;
};

const commonSearchCases: CommonSearchCase[] = [
  {query: 'install zero', expectedTopComposedUrl: '/docs/install#install-zero'},
  {
    query: 'npm install @rocicorp/zero',
    expectedTopComposedUrl: '/docs/install#install-zero',
  },
  {query: 'zero-cache-dev', expectedTopUrl: '/docs/tutorial'},
  {query: 'ZeroProvider', expectedTopUrl: '/docs/react'},
  {query: 'useQuery', expectedTopUrl: '/docs/react'},
  {query: 'useSuspenseQuery', expectedTopComposedUrl: '/docs/react#suspense'},
  {query: 'react native', expectedTopUrl: '/docs/react-native'},
  {query: 'createSchema', expectedTopUrl: '/docs/schema'},
  {
    query: 'relationships',
    expectedTopComposedUrl: '/docs/schema#relationships',
  },
  {
    query: 'schema changes',
    expectedTopComposedUrl: '/docs/schema#schema-changes',
  },
  {
    query: 'postgres column types',
    expectedTopComposedUrl: '/docs/postgres-support#column-types',
  },
  {query: 'defineQuery', expectedTopUrl: '/docs/queries'},
  {
    query: 'whereExists',
    expectedTopUrl: '/docs/zql',
  },
  {query: 'ttl', expectedTopComposedUrl: '/docs/queries#ttls'},
  {query: 'defineMutator', expectedTopUrl: '/docs/mutators'},
  {query: 'write data', expectedTopComposedUrl: '/docs/mutators#writing-data'},
  {
    query: 'server mutators',
    expectedTopComposedUrl: '/docs/mutators#server-setup',
  },
  {query: 'auth', expectedTopUrl: '/docs/auth'},
  {
    query: 'cookie authentication',
    expectedTopComposedUrl: '/docs/auth#cookies',
  },
  {query: 'token auth', expectedTopComposedUrl: '/docs/auth#tokens'},
  {
    query: 'read permissions',
    expectedTopComposedUrl: '/docs/auth#read-permissions',
  },
  {
    query: 'write permissions',
    expectedTopComposedUrl: '/docs/auth#write-permissions',
  },
  {query: 'zero-cache config', expectedTopUrl: '/docs/zero-cache-config'},
  {
    query: 'ZERO_UPSTREAM_DB',
    expectedTopComposedUrl: '/docs/zero-cache-config#upstream-db',
  },
  {
    query: 'admin password',
    expectedTopComposedUrl: '/docs/zero-cache-config#admin-password',
  },
  {query: 'self host', expectedTopUrl: '/docs/self-host'},
  {query: 'docker compose', expectedTopUrl: '/docs/self-host'},
  {
    query: 'ghcr docker',
    expectedTopComposedUrl: '/docs/self-host#docker-images',
  },
  {
    query: 'connecting to postgres',
    expectedTopUrl: '/docs/connecting-to-postgres',
  },
  {
    query: 'wal level',
    expectedTopComposedUrl: '/docs/connecting-to-postgres#wal-level',
  },
  {
    query: 'logical replication',
    expectedTopComposedUrl: '/docs/connecting-to-postgres#logical-replication',
  },
  {
    query: 'otel metrics',
    expectedTopComposedUrl: '/docs/otel#metrics-reference',
  },
  {
    query: 'inspector analyze',
    expectedTopComposedUrl: '/docs/debug/inspector#analyzing-queries',
  },
  {query: 'analyze query cli', expectedTopUrl: '/docs/debug/analyze-query-cli'},
  {query: 'release notes 1.8', expectedTopUrl: '/docs/release-notes/1.8'},
  {query: 'instal', expectedTopUrl: '/docs/install'},
  {query: 'instal zero', expectedTopComposedUrl: '/docs/install#install-zero'},
  {query: 'cache dev', expectedTopUrl: '/docs/tutorial'},
  {query: 'zeroprovider', expectedTopUrl: '/docs/react'},
  {query: 'usequer', expectedTopUrl: '/docs/react'},
  {query: 'suspense query', expectedTopUrl: '/docs/react'},
  {query: 'schema gen', expectedTopUrl: '/docs/schema'},
  {query: 'drizzle schema', expectedTopUrl: '/docs/schema'},
  {
    query: 'many many',
    expectedTopComposedUrl: '/docs/schema#many-to-many-relationships',
  },
  {query: 'relations', expectedTopComposedUrl: '/docs/schema#relationships'},
  {
    query: 'where exist',
    expectedTopUrl: '/docs/zql',
  },
  {query: 'mutator', expectedTopUrl: '/docs/mutators'},
  {query: 'server mut', expectedTopUrl: '/docs/mutators'},
  {query: 'cookies', expectedTopComposedUrl: '/docs/auth#cookies'},
  {query: 'jwt', expectedTopUrl: '/docs/zero-cache-config'},
  {
    query: 'permiss',
    expectedTopComposedUrl: '/docs/mutators#permissions',
  },
  {
    query: 'read permiss',
    expectedTopComposedUrl: '/docs/auth#read-permissions',
  },
  {
    query: 'write permiss',
    expectedTopComposedUrl: '/docs/auth#write-permissions',
  },
  {query: 'env vars', expectedTopUrl: '/docs/debug/analyze-query-cli'},
  {
    query: 'upstream db',
    expectedTopComposedUrl: '/docs/zero-cache-config#upstream-db',
  },
  {
    query: 'ZERO_UPSTREAM',
    expectedTopComposedUrl: '/docs/zero-cache-config#upstream-db',
  },
  {
    query: 'admin pass',
    expectedTopComposedUrl: '/docs/zero-cache-config#admin-password',
  },
  {query: 'ghcr', expectedTopComposedUrl: '/docs/self-host#docker-images'},
  {query: 'docker', expectedTopUrl: '/docs/self-host'},
  {
    query: 'wal',
    expectedTopComposedUrl: '/docs/connecting-to-postgres#wal-level',
  },
  {
    query: 'wal_level',
    expectedTopComposedUrl: '/docs/connecting-to-postgres#wal-level',
  },
  {
    query: 'supabase',
    expectedTopComposedUrl: '/docs/connecting-to-postgres#supabase',
  },
  {
    query: 'neon',
    expectedTopComposedUrl: '/docs/connecting-to-postgres#neon',
  },
  {query: 'otel', expectedTopUrl: '/docs/otel'},
  {query: 'metrics', expectedTopComposedUrl: '/docs/otel#metrics-reference'},
  {query: 'slow quer', expectedTopUrl: '/docs/debug/slow-queries'},
  {
    query: 'query plans',
    expectedTopComposedUrl: '/docs/zql#inspecting-query-plans',
  },
  {
    query: 'replication reset',
    expectedTopComposedUrl: '/docs/debug/replication#resetting',
  },
  {query: '1.8', expectedTopUrl: '/docs/release-notes/1.8'},
];

describe('search index', () => {
  it('creates section records for headings', async () => {
    const docs = await extractDocumentsFromMDX(getDocPath('zql'));
    const typeHelpersSection = docs.find(
      doc => doc.sectionId === 'type-helpers',
    );

    expect(typeHelpersSection?.sectionTitle).toBe('Type Helpers');
    expect(typeHelpersSection?.url).toBe('/docs/zql');
  });

  it('prioritizes section matches for multi-word queries', async () => {
    const docs = await extractDocumentsFromMDX(getDocPath('zql'));
    const index = createLunrIndex(docs);
    const results = searchDocuments({
      index,
      documents: docs,
      query: 'type helpers',
    });

    expect(results[0]?.composedUrl).toBe('/docs/zql#type-helpers');
  });

  it('handles punctuation-heavy queries', async () => {
    const docs = await extractDocumentsFromMDX(getDocPath('install'));
    const index = createLunrIndex(docs);
    const results = searchDocuments({
      index,
      documents: docs,
      query: 'postgres://',
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.composedUrl.startsWith('/docs/install')).toBe(true);
  });

  it('preserves dotted version numbers', () => {
    const docs: SearchDocument[] = [
      {
        id: 'release-1.8',
        title: 'Zero 1.8',
        searchTitle: 'Zero 1.8',
        content: 'Install Zero 1.8 for the latest improvements.',
        url: '/docs/release-notes/1.8',
        kind: 'page',
      },
      {
        id: 'zql',
        title: 'ZQL',
        searchTitle: 'ZQL',
        content: 'Call limit(100), subtract 1, and encode as UTF-8.',
        url: '/docs/zql',
        kind: 'page',
      },
    ];
    const index = createLunrIndex(docs);
    const results = searchDocuments({index, documents: docs, query: '1.8'});

    expect(results[0]?.url).toBe('/docs/release-notes/1.8');
    expect(results.some(result => result.id === 'zql')).toBe(false);
    expect(results[0]?.snippet).toContain('<mark>1.8</mark>');
    expect(results[0]?.snippet).not.toContain('<mark>1</mark>00');
  });

  describe('common documentation searches', () => {
    let docs: SearchDocument[];
    let index: ReturnType<typeof createLunrIndex>;

    beforeAll(async () => {
      docs = await loadAllSearchDocuments();
      index = createLunrIndex(docs);
    }, 30_000);

    it.each(
      commonSearchCases.map(testCase => [testCase.query, testCase] as const),
    )('returns the expected top result for %s', (_query, testCase) => {
      const results = searchDocuments({
        index,
        documents: docs,
        query: testCase.query,
      });
      const topResult = results[0];

      expect(topResult, `Expected results for ${testCase.query}`).toBeTruthy();
      if (testCase.expectedTopComposedUrl) {
        expect(topResult?.composedUrl).toBe(testCase.expectedTopComposedUrl);
      }
      if (testCase.expectedTopUrl) {
        expect(topResult?.url).toBe(testCase.expectedTopUrl);
      }
    });
  });
});
