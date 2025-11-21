'use client';

import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {
  CODE_GROUP_COOKIE,
  CodeGroupSyncMap,
  normalizeSyncMap,
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

export function CodeGroupProvider({
  children,
  initialSync,
}: CodeGroupProviderProps) {
  const [selection, setSelection] = useState<CodeGroupSyncMap>(
    () => initialSync ?? {},
  );

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
