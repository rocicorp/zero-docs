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
  CodeGroupSyncMap,
  normalizeSyncMap,
  parseCodeGroupCookie,
  serializeCodeGroupCookie,
} from '@/lib/code-group-sync';

type CodeGroupContextValue = {
  selection: CodeGroupSyncMap;
  updateSelection: (partial: CodeGroupSyncMap) => void;
  state: 'loading' | 'ready';
};

const CodeGroupContext = createContext<CodeGroupContextValue | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

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
      if (typeof document !== 'undefined') {
        const serialized = serializeCodeGroupCookie(next);
        if (serialized) {
          document.cookie = `${CODE_GROUP_COOKIE}=${serialized}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    // Read cookie on client side after mount
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const codeGroupCookie = cookies.find(cookie =>
        cookie.trim().startsWith(`${CODE_GROUP_COOKIE}=`),
      );

      if (codeGroupCookie) {
        const value = codeGroupCookie.split('=')[1];
        const parsed = parseCodeGroupCookie(value);
        setSelection(prev => ({...prev, ...parsed}));
      }
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
