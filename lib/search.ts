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

const tokenize = (value: string) =>
  lunr
    .tokenizer(value)
    .map(token =>
      token.toString().toLowerCase().replace(/^\W+/, '').replace(/\W+$/, ''),
    )
    .filter(Boolean);

const splitPunctuation = (tokens: string[]) =>
  tokens.flatMap(token => token.split(/[^a-z0-9]+/i)).filter(Boolean);

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();

const urlToText = (url: string) =>
  normalizeText(url.replace(/^\/docs\/?/, '').replace(/\//g, ' '));

const versionPattern = /\b\d+\.\d+(?:\.\d+)?\b/g;
const hasVersionPattern = /\b\d+\.\d+(?:\.\d+)?\b/;

const isReleaseQuery = (query: string) =>
  /\b(release|notes?|changelog|versions?|upgrade|upgrading|breaking)\b/i.test(
    query,
  ) || hasVersionPattern.test(query);

const isDeprecatedQuery = (query: string) =>
  /\b(deprecated|legacy|old|rls|crud|synced\s*query|ad\s*-?\s*hoc)\b/i.test(
    query,
  );

const tokenMatchesText = (token: string, text: string) => {
  const normalizedToken = normalizeText(token);
  if (!normalizedToken) return false;
  return text
    .split(' ')
    .some(part => part === normalizedToken || part.startsWith(normalizedToken));
};

const allTokensMatchText = (tokens: string[], text: string) =>
  tokens.length > 0 && tokens.every(token => tokenMatchesText(token, text));

const isClientApiQuery = (tokens: string[]) =>
  tokens.some(
    token => /^use[a-z0-9]{2,}/i.test(token) || /provider$/i.test(token),
  );

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
    b.field('title', {boost: 10});
    b.field('urlTokens', {boost: 8});
    b.field('content');
    b.field('headings', {boost: 6});

    for (const doc of docs) {
      b.add({
        id: doc.id,
        searchTitle: doc.searchTitle?.toLowerCase() ?? '',
        sectionTitle: doc.sectionTitle?.toLowerCase() ?? '',
        title: doc.title?.toLowerCase() ?? '',
        urlTokens: urlToText(doc.url),
        content: doc.content?.toLowerCase() ?? '',
        headings: (doc.headings ?? [])
          .map(heading => heading.text.toLowerCase())
          .join(' '),
      });
    }
  });
};

const getRankingBoost = (
  doc: SearchDocument,
  query: string,
  tokens: string[],
) => {
  const normalizedPhrase = normalizeText(query);
  if (!normalizedPhrase) return 0;

  const searchTitle = normalizeText(doc.searchTitle ?? '');
  const sectionTitle = normalizeText(doc.sectionTitle ?? '');
  const pageTitle = normalizeText(doc.title);
  const urlText = urlToText(doc.url);
  const titleText = normalizeText(
    `${doc.title} ${doc.searchTitle ?? ''} ${doc.sectionTitle ?? ''} ${urlText}`,
  );
  const headingsText = (doc.headings ?? [])
    .map(heading => normalizeText(heading.text))
    .join(' ');
  const content = normalizeText(doc.content);

  let boost = 0;

  if (sectionTitle === normalizedPhrase) boost += 28;
  else if (sectionTitle.includes(normalizedPhrase)) boost += 18;

  if (searchTitle === normalizedPhrase) boost += 24;
  else if (searchTitle.includes(normalizedPhrase)) boost += 14;

  if (pageTitle === normalizedPhrase) boost += 22;
  else if (pageTitle.includes(normalizedPhrase)) boost += 12;

  if (titleText.includes(normalizedPhrase)) boost += 8;
  if (headingsText.includes(normalizedPhrase)) boost += 4;
  if (content.includes(normalizedPhrase)) boost += 1;

  const comparableTokens = tokens.filter(token => token.length > 1);
  if (allTokensMatchText(comparableTokens, titleText)) boost += 12;
  if (allTokensMatchText(comparableTokens, sectionTitle)) boost += 10;
  if (allTokensMatchText(comparableTokens, searchTitle)) boost += 8;
  if (allTokensMatchText(comparableTokens, pageTitle)) boost += 6;

  if (isClientApiQuery(tokens)) {
    if (doc.url === '/docs/react') boost += 8;
    else if (doc.url === '/docs/solidjs' || doc.url === '/docs/react-native') {
      boost += 5;
    } else if (doc.url === '/docs/queries') {
      boost += 3;
    }
  }

  for (const version of query.match(versionPattern) ?? []) {
    if (doc.url.includes(version) || doc.title.includes(version)) {
      boost += 20;
    }
  }

  return boost;
};

const getRankingMultiplier = (doc: SearchDocument, query: string) => {
  let multiplier = 1;

  if (doc.url.startsWith('/docs/release-notes') && !isReleaseQuery(query)) {
    multiplier *= 0.2;
  }

  if (doc.url.startsWith('/docs/deprecated') && !isDeprecatedQuery(query)) {
    multiplier *= 0.15;
  }

  if (
    !isDeprecatedQuery(query) &&
    normalizeText(`${doc.searchTitle} ${doc.sectionTitle ?? ''}`).includes(
      'deprecated',
    )
  ) {
    multiplier *= 0.2;
  }

  return multiplier;
};

const getFuzzyDistance = (token: string) => {
  if (token.length < 4) return null;
  if (token.length < 7) return 1;
  return 2;
};

type QueryStrategy = 'exact' | 'prefix' | 'fuzzy';

const buildQuery = (
  builder: lunr.Query,
  tokens: string[],
  {
    presence,
    strategy,
  }: {
    presence: lunr.Query.presence;
    strategy: QueryStrategy;
  },
) => {
  for (const token of tokens) {
    if (strategy === 'exact') {
      builder.term(token, {boost: 8, presence});
    } else if (strategy === 'prefix') {
      builder.term(token, {
        boost: 4,
        presence,
        wildcard: lunr.Query.wildcard.TRAILING,
      });
    } else {
      const editDistance = getFuzzyDistance(token);
      if (editDistance !== null) {
        builder.term(token, {
          boost: 1.25,
          presence,
          editDistance,
        });
      } else {
        builder.term(token, {boost: 8, presence});
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

  const primaryTokens = tokenize(sanitizedInput);
  if (!primaryTokens.length) return [];

  const fallbackTokens = splitPunctuation(primaryTokens);
  const tokenSets = [primaryTokens];
  const preservesVersionToken = primaryTokens.some(token =>
    hasVersionPattern.test(token),
  );
  if (
    !preservesVersionToken &&
    fallbackTokens.length &&
    (fallbackTokens.length !== primaryTokens.length ||
      fallbackTokens.some((token, index) => token !== primaryTokens[index]))
  ) {
    tokenSets.push(fallbackTokens);
  }

  const runQueries = (strategies: QueryStrategy[], optionalOnly = false) => {
    const resultsByRef = new Map<string, lunr.Index.Result>();
    let matchedTokens: string[] | null = null;

    for (const tokens of tokenSets) {
      if (optionalOnly && tokens.length < 2) continue;

      const presence = optionalOnly
        ? lunr.Query.presence.OPTIONAL
        : tokens.length > 1
          ? lunr.Query.presence.REQUIRED
          : lunr.Query.presence.OPTIONAL;
      for (const strategy of strategies) {
        const results = index.query(builder =>
          buildQuery(builder, tokens, {presence, strategy}),
        );
        if (results.length && !matchedTokens) matchedTokens = tokens;

        for (const result of results) {
          const existing = resultsByRef.get(result.ref);
          if (!existing || result.score > existing.score) {
            resultsByRef.set(result.ref, result);
          }
        }
      }
    }

    return resultsByRef.size && matchedTokens
      ? {results: Array.from(resultsByRef.values()), tokens: matchedTokens}
      : null;
  };

  const match =
    runQueries(['exact', 'prefix']) ??
    runQueries(['fuzzy']) ??
    runQueries(['fuzzy'], true);
  if (!match) return [];

  const {results, tokens} = match;

  const documentsById = new Map(documents.map(doc => [doc.id, doc]));
  const highlightTerms = Array.from(
    new Set([sanitizedInput, ...tokens].filter(Boolean)),
  );

  const scoredResults = results
    .map(result => {
      const doc = documentsById.get(result.ref);
      if (!doc) return null;

      const score =
        (result.score + getRankingBoost(doc, sanitizedInput, tokens)) *
        getRankingMultiplier(doc, sanitizedInput);

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
