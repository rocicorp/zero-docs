import lunr from 'lunr';
import type {SearchDocument, SearchHeading} from './search-types';

export type SearchResult = SearchDocument & {
  snippet?: string;
  snippetId?: string;
  composedUrl: string;
  score: number;
};

const SNIPPET_LENGTH = 120;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeTokens = (value: string) =>
  lunr
    .tokenizer(value)
    .map(token => token.toString().toLowerCase())
    .flatMap(token => token.split(/[^a-z0-9]+/i))
    .filter(Boolean);

const findFirstMatchIndex = (content: string, terms: string[]) => {
  const lowerContent = content.toLowerCase();
  let bestIndex = -1;

  for (const rawTerm of terms) {
    const term = rawTerm.toLowerCase();
    if (!term) continue;
    const index = lowerContent.indexOf(term);
    if (index === -1) continue;
    if (bestIndex === -1 || index < bestIndex) {
      bestIndex = index;
    }
  }

  return bestIndex;
};

const extractSnippet = (
  content: string,
  terms: string[],
  snippetLength = SNIPPET_LENGTH,
): string => {
  if (!content) return '';
  const trimmedContent = content.trim();
  if (!trimmedContent) return '';

  const normalizedTerms = terms.filter(Boolean);
  const matchIndex = findFirstMatchIndex(trimmedContent, normalizedTerms);
  if (matchIndex === -1) {
    const fallback = trimmedContent.substring(0, snippetLength).trim();
    return fallback ? `${fallback}...` : '';
  }

  const start = Math.max(matchIndex - snippetLength / 2, 0);
  const end = Math.min(start + snippetLength, trimmedContent.length);
  let snippet = trimmedContent.substring(start, end);

  if (normalizedTerms.length > 0) {
    const escapedTerms = normalizedTerms
      .map(term => escapeRegExp(term))
      .filter(Boolean);
    if (escapedTerms.length > 0) {
      const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    }
  }

  return `...${snippet}...`;
};

const findNearestHeadingId = (
  content: string,
  headings: SearchHeading[],
  searchTerms: string[],
): string => {
  if (!headings.length) return '';

  const snippetIndex = findFirstMatchIndex(content, searchTerms);
  if (snippetIndex === -1) return headings[0]?.id ?? '';

  const lowerContent = content.toLowerCase();
  const validHeadings = headings
    .map(heading => ({
      ...heading,
      index: lowerContent.indexOf(heading.text.toLowerCase()),
    }))
    .filter(heading => heading.index !== -1)
    .sort((a, b) => a.index - b.index);

  let closestHeading = null as (typeof validHeadings)[number] | null;

  for (const heading of validHeadings) {
    if (heading.index > snippetIndex) break;
    closestHeading = heading;
  }

  const finalHeading =
    closestHeading ?? validHeadings.find(h => h.index > snippetIndex);

  return finalHeading?.id ?? headings[0]?.id ?? '';
};

export const createLunrIndex = (docs: SearchDocument[]) => {
  return lunr(b => {
    b.ref('id');
    b.field('searchTitle', {boost: 14});
    b.field('sectionTitle', {boost: 16});
    b.field('content');
    b.field('headings', {boost: 6});

    for (const doc of docs) {
      b.add({
        id: doc.id,
        searchTitle: doc.searchTitle?.toLowerCase() ?? '',
        sectionTitle: doc.sectionTitle?.toLowerCase() ?? '',
        content: doc.content?.toLowerCase() ?? '',
        headings: (doc.headings ?? [])
          .map(heading => heading.text.toLowerCase())
          .join(' '),
      });
    }
  });
};

const getPhraseBoost = (doc: SearchDocument, phrase: string) => {
  if (!phrase) return 0;
  const normalizedPhrase = phrase.toLowerCase();

  const sectionTitle = doc.sectionTitle?.toLowerCase() ?? '';
  const pageTitle = doc.title.toLowerCase();
  const headingsText = (doc.headings ?? [])
    .map(heading => heading.text.toLowerCase())
    .join(' ');
  const content = doc.content.toLowerCase();

  if (sectionTitle && sectionTitle.includes(normalizedPhrase)) return 6;
  if (pageTitle.includes(normalizedPhrase)) return 4;
  if (headingsText.includes(normalizedPhrase)) return 3;
  if (content.includes(normalizedPhrase)) return 1;
  return 0;
};

const getFuzzyDistance = (token: string) => {
  if (token.length < 4) return null;
  if (token.length < 7) return 1;
  return 2;
};

const buildQuery = (
  builder: lunr.Query,
  tokens: string[],
  {
    presence,
    includeFuzzy,
  }: {
    presence: lunr.Query.presence;
    includeFuzzy: boolean;
  },
) => {
  for (const token of tokens) {
    builder.term(token, {boost: 8, presence});
    builder.term(token, {
      boost: 3,
      presence,
      wildcard: lunr.Query.wildcard.TRAILING,
    });

    if (includeFuzzy) {
      const editDistance = getFuzzyDistance(token);
      if (editDistance !== null) {
        builder.term(token, {
          boost: 1.25,
          presence,
          editDistance,
        });
      }
    }
  }
};

export const searchDocuments = ({
  index,
  documents,
  query,
}: {
  index: lunr.Index;
  documents: SearchDocument[];
  query: string;
}): SearchResult[] => {
  const sanitizedInput = query.trim();
  if (!sanitizedInput) return [];

  const tokens = normalizeTokens(sanitizedInput);
  if (!tokens.length) return [];

  const requiredPresence =
    tokens.length > 1
      ? lunr.Query.presence.REQUIRED
      : lunr.Query.presence.OPTIONAL;

  const runQuery = (config: {
    presence: lunr.Query.presence;
    includeFuzzy: boolean;
  }) => index.query(builder => buildQuery(builder, tokens, config));

  let results = runQuery({presence: requiredPresence, includeFuzzy: false});
  if (!results.length) {
    results = runQuery({presence: requiredPresence, includeFuzzy: true});
  }
  if (!results.length && tokens.length > 1) {
    results = runQuery({
      presence: lunr.Query.presence.OPTIONAL,
      includeFuzzy: true,
    });
  }

  if (!results.length) return [];

  const documentsById = new Map(documents.map(doc => [doc.id, doc]));
  const phrase = tokens.length > 1 ? tokens.join(' ') : '';
  const highlightTerms = Array.from(
    new Set([sanitizedInput, ...tokens].filter(Boolean)),
  );

  const scoredResults = results
    .map(result => {
      const doc = documentsById.get(result.ref);
      if (!doc) return null;

      const phraseBoost = tokens.length > 1 ? getPhraseBoost(doc, phrase) : 0;
      const score = result.score + phraseBoost;

      const snippet = extractSnippet(doc.content, highlightTerms);
      const snippetId =
        doc.kind === 'section'
          ? doc.sectionId
          : findNearestHeadingId(doc.content, doc.headings ?? [], [
              sanitizedInput,
              ...tokens,
            ]);

      const composedUrl = snippetId ? `${doc.url}#${snippetId}` : doc.url;

      return {
        ...doc,
        snippet,
        snippetId,
        composedUrl,
        score,
      };
    })
    .filter(Boolean)
    .map(result => result!);

  scoredResults.sort((a, b) => b.score - a.score);

  const uniqueResults = new Map<string, SearchResult>();
  for (const result of scoredResults) {
    if (!uniqueResults.has(result.id)) {
      uniqueResults.set(result.id, result);
    }
  }

  return Array.from(uniqueResults.values());
};
