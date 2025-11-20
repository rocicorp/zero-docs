export type CodeGroupSyncMap = Record<string, string>;

export const CODE_GROUP_COOKIE = 'zero-docs-code-group';

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
