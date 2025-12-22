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
};

const CodeGroupContext = createContext<CodeGroupContextValue | null>(null);

type CodeGroupProviderProps = {
  children: React.ReactNode;
  initialSync?: CodeGroupSyncMap;
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type CodeGroupClientWrapperProps = {
  children: React.ReactNode;
};

export function CodeGroupClientWrapper({
  children,
}: CodeGroupClientWrapperProps) {
  const [initialSync, setInitialSync] = useState<CodeGroupSyncMap>({});

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
        setInitialSync(parsed);
      }
    }
  }, []);

  return (
    <CodeGroupProvider initialSync={initialSync}>{children}</CodeGroupProvider>
  );
}

export function CodeGroupProvider({
  children,
  initialSync,
}: CodeGroupProviderProps) {
  const [selection, setSelection] = useState<CodeGroupSyncMap>(
    () => initialSync ?? {},
  );

  useEffect(() => {
    if (initialSync && Object.keys(initialSync).length > 0) {
      setSelection(prev => ({...prev, ...initialSync}));
    }
  }, [initialSync]);

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

  const value = useMemo(
    () => ({
      selection,
      updateSelection,
    }),
    [selection, updateSelection],
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
