'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CODE_GROUP_COOKIE,
  CODE_GROUP_QUERY_PARAM,
  CodeGroupSyncMap,
  normalizeSyncMap,
  parseCodeGroupCookie,
  parseCodeGroupQueryParam,
  serializeCodeGroupCookie,
  serializeCodeGroupQueryParam,
} from '@/lib/code-group-sync';

type CodeGroupContextValue = {
  selection: CodeGroupSyncMap;
  updateSelection: (partial: CodeGroupSyncMap) => void;
  state: 'loading' | 'ready';
};

const CodeGroupContext = createContext<CodeGroupContextValue | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const hasSelectionChanged = (
  current: CodeGroupSyncMap,
  next: CodeGroupSyncMap,
) => {
  const currentKeys = Object.keys(current);
  const nextKeys = Object.keys(next);

  if (currentKeys.length !== nextKeys.length) {
    return true;
  }

  return nextKeys.some(key => current[key] !== next[key]);
};

const readCodeGroupCookie = () => {
  if (typeof document === 'undefined') {
    return {};
  }

  const cookies = document.cookie.split(';');
  const codeGroupCookie = cookies.find(cookie =>
    cookie.trim().startsWith(`${CODE_GROUP_COOKIE}=`),
  );

  if (!codeGroupCookie) {
    return {};
  }

  const [, ...valueParts] = codeGroupCookie.split('=');
  return parseCodeGroupCookie(valueParts.join('='));
};

const readCodeGroupQueryParam = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);
  return parseCodeGroupQueryParam(searchParams.get(CODE_GROUP_QUERY_PARAM));
};

const writeCodeGroupCookie = (selection: CodeGroupSyncMap) => {
  if (typeof document === 'undefined') {
    return;
  }

  const serialized = serializeCodeGroupCookie(selection);
  if (!serialized) {
    return;
  }

  document.cookie = `${CODE_GROUP_COOKIE}=${serialized}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const writeCodeGroupQueryParam = (selection: CodeGroupSyncMap) => {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  const serialized = serializeCodeGroupQueryParam(selection);

  if (serialized) {
    url.searchParams.set(CODE_GROUP_QUERY_PARAM, serialized);
  } else {
    url.searchParams.delete(CODE_GROUP_QUERY_PARAM);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(window.history.state, '', nextUrl);
  }
};

type CodeGroupProviderProps = {
  children: React.ReactNode;
};

export function CodeGroupProvider({children}: CodeGroupProviderProps) {
  const [state, setState] = useState<'loading' | 'ready'>('loading');
  const [selection, setSelection] = useState<CodeGroupSyncMap>({});

  const updateSelection = useCallback((partial: CodeGroupSyncMap) => {
    const normalized = normalizeSyncMap(partial);
    if (!Object.keys(normalized).length) return;

    setSelection(prev => {
      const next = {...prev, ...normalized};

      if (hasSelectionChanged(prev, next)) {
        writeCodeGroupCookie(next);
        writeCodeGroupQueryParam(next);
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const cookieSelection = readCodeGroupCookie();
    const querySelection = readCodeGroupQueryParam();
    const nextSelection = normalizeSyncMap({
      ...querySelection,
      ...cookieSelection,
    });

    if (Object.keys(nextSelection).length) {
      setSelection(nextSelection);
    }

    if (hasSelectionChanged(cookieSelection, nextSelection)) {
      writeCodeGroupCookie(nextSelection);
    }

    setState('ready');
  }, []);

  const value = useMemo(
    () => ({
      selection,
      updateSelection,
      state,
    }),
    [selection, updateSelection, state],
  );

  return (
    <CodeGroupContext.Provider value={value}>
      {children}
    </CodeGroupContext.Provider>
  );
}

export function useCodeGroupSync() {
  const context = useContext(CodeGroupContext);
  if (!context) {
    throw new Error('useCodeGroupSync must be used within CodeGroupProvider');
  }
  return context;
}
