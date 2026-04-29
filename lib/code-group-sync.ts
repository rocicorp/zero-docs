export type CodeGroupSyncMap = Record<string, string>;

export const CODE_GROUP_COOKIE = 'zero-docs-code-group';
export const CODE_GROUP_QUERY_PARAM = 'codeGroup';

const normalizeKey = (key?: string) => key?.trim().toLowerCase() ?? '';
const normalizeValue = (value?: string) => value?.trim().toLowerCase() ?? '';

export const normalizeSyncMap = (
  input?: CodeGroupSyncMap | null,
): CodeGroupSyncMap => {
  if (!input) return {};
  return Object.entries(input).reduce<CodeGroupSyncMap>((acc, [key, value]) => {
    if (typeof value !== 'string') return acc;
    const normalizedKey = normalizeKey(key);
    const normalizedValue = normalizeValue(value);
    if (normalizedKey && normalizedValue) {
      acc[normalizedKey] = normalizedValue;
    }
    return acc;
  }, {});
};

export const parseCodeGroupCookie = (
  rawValue: string | null | undefined,
): CodeGroupSyncMap => {
  if (!rawValue) return {};
  try {
    const decoded = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decoded);
    return normalizeSyncMap(parsed);
  } catch {
    return {};
  }
};

export const parseCodeGroupQueryParam = (
  rawValue: string | null | undefined,
): CodeGroupSyncMap => {
  if (!rawValue) return {};

  return rawValue.split(',').reduce<CodeGroupSyncMap>((acc, entry) => {
    const separatorIndex = entry.indexOf(':');
    if (separatorIndex === -1) return acc;

    const key = normalizeKey(entry.slice(0, separatorIndex));
    const value = normalizeValue(entry.slice(separatorIndex + 1));

    if (key && value) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

export const serializeCodeGroupCookie = (
  sync: CodeGroupSyncMap,
): string | null => {
  const entries = Object.keys(sync);
  if (!entries.length) return null;
  try {
    return encodeURIComponent(JSON.stringify(sync));
  } catch {
    return null;
  }
};

export const serializeCodeGroupQueryParam = (
  sync: CodeGroupSyncMap,
): string | null => {
  const normalized = normalizeSyncMap(sync);
  const entries = Object.entries(normalized).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  if (!entries.length) return null;

  return entries.map(([key, value]) => `${key}:${value}`).join(',');
};
