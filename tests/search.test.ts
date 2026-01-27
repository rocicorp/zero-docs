import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {createLunrIndex, searchDocuments} from '@/lib/search';
import {extractDocumentsFromMDX} from '@/lib/generateSearchIndex';

const getDocPath = (slug: string) =>
  path.join(process.cwd(), 'contents', 'docs', `${slug}.mdx`);

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
});
