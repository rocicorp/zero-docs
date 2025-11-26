'use client';

import {
  Children,
  ReactElement,
  ReactNode,
  isValidElement,
  useMemo,
} from 'react';
import {useCodeGroupSync} from './code-group-provider';

type SyncedCodeProps = {
  children: ReactNode;
  syncValues: string[];
  syncKey: string;
  fallbackValue?: string;
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? '';

export default function SyncedCode({
  children,
  syncValues,
  syncKey,
  fallbackValue,
}: SyncedCodeProps) {
  const {selection} = useCodeGroupSync();

  const blocks = useMemo(
    () =>
      Children.toArray(children).filter((child): child is ReactElement =>
        isValidElement(child),
      ),
    [children],
  );

  const normalizedKey = normalize(syncKey);
  const normalizedValues = useMemo(
    () => syncValues.map(normalize),
    [syncValues],
  );

  const mappedByValue = useMemo(() => {
    const mapping: Record<string, ReactElement> = {};
    const limit = Math.min(blocks.length, normalizedValues.length);
    for (let i = 0; i < limit; i += 1) {
      const value = normalizedValues[i];
      if (!value) continue;
      if (!mapping[value]) {
        mapping[value] = blocks[i] as ReactElement;
      }
    }
    return mapping;
  }, [blocks, normalizedValues]);

  const normalizedFallback =
    normalize(fallbackValue) || normalizedValues.find(Boolean) || '';
  const activeValue = normalizedKey ? selection[normalizedKey] : undefined;

  const selected =
    (activeValue && mappedByValue[activeValue]) ||
    (normalizedFallback && mappedByValue[normalizedFallback]) ||
    blocks[0] ||
    null;

  if (syncValues.length !== blocks.length) {
    throw new Error(
      `SyncedCode blocks and syncValues must have the same length. Check your component with syncValues: (${syncValues.join(', ')}).`,
    );
  }

  return selected;
}
