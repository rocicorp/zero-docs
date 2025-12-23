'use client';

import {
  Children,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import * as Tabs from '@radix-ui/react-tabs';
import {useCodeGroupSync} from '@/components/code-group-provider';
import {CodeGroupSyncMap, normalizeSyncMap} from '@/lib/code-group-sync';
import {CodeSkeleton} from '@/components/ui/skeleton';

type CodeGroupLabel = {
  text: string;
  sync?: CodeGroupSyncMap;
};

type NormalizedLabel = {
  text: string;
  sync: CodeGroupSyncMap;
};

const normalizeLabel = (
  label: CodeGroupLabel | undefined,
  index: number,
): NormalizedLabel => {
  if (!label) {
    return {
      text: `Option ${index + 1}`,
      sync: {},
    };
  }

  if (typeof label === 'string') {
    return {
      text: label,
      sync: {},
    };
  }

  return {
    text: label.text || `Option ${index + 1}`,
    sync: normalizeSyncMap(label.sync ?? null),
  };
};

const findBestMatch = (
  labels: NormalizedLabel[],
  selection: CodeGroupSyncMap,
) => {
  let bestIndex = -1;
  let bestScore = 0;

  labels.forEach((label, index) => {
    const categories = Object.keys(label.sync);
    if (!categories.length) return;
    let score = 0;
    categories.forEach(category => {
      const selectedValue = selection[category];
      if (selectedValue && label.sync[category] === selectedValue) {
        score += 1;
      }
    });
    if (score > 0 && score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
};

export type CodeGroupProps = {
  labels?: CodeGroupLabel[];
  children: ReactNode;
  defaultLabel?: string;
};

export default function CodeGroup({
  labels = [],
  children,
  defaultLabel,
}: CodeGroupProps) {
  const [isClient, setIsClient] = useState(false);

  const codeBlocks = useMemo(() => {
    return Children.toArray(children).filter(child => {
      if (typeof child === 'string') {
        return false;
      }
      return Boolean(child);
    }) as ReactElement[];
  }, [children]);

  if (codeBlocks.length !== labels.length) {
    throw new Error(
      `CodeGroup code blocks and labels must have the same length. Check your component with labels: (${labels.map(label => label.text).join(', ')}) and ${codeBlocks.length} code block(s).`,
    );
  }

  const normalizedLabels = useMemo(() => {
    return codeBlocks.map((_, index) => normalizeLabel(labels[index], index));
  }, [codeBlocks, labels]);

  const {selection, updateSelection} = useCodeGroupSync();

  // Initialize as -1 as it gets set on client
  const [activeIndex, setActiveIndex] = useState(-1);

  const manualSelectionRef = useRef(false);

  const computeActiveIndex = useCallback(() => {
    // User preference
    const matchIndex = findBestMatch(normalizedLabels, selection);

    if (matchIndex !== -1) return matchIndex;

    // Default prop
    if (defaultLabel) {
      const defaultIndex = normalizedLabels.findIndex(
        label => label.text === defaultLabel,
      );
      if (defaultIndex >= 0 && defaultIndex < codeBlocks.length) {
        return defaultIndex;
      }
    }

    // Default
    return 0;
  }, [normalizedLabels, selection, defaultLabel, codeBlocks.length]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setActiveIndex(current => (current >= codeBlocks.length ? 0 : current));
  }, [codeBlocks.length]);

  useEffect(() => {
    if (!isClient || !normalizedLabels.length || manualSelectionRef.current)
      return;

    const newIndex = computeActiveIndex();
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [isClient, normalizedLabels, computeActiveIndex, activeIndex]);

  if (!codeBlocks.length) {
    return null;
  }

  const handleSelect = (index: number) => {
    manualSelectionRef.current = true;
    setActiveIndex(index);
    const selectedLabel = normalizedLabels[index];
    if (Object.keys(selectedLabel.sync).length) {
      updateSelection(selectedLabel.sync);
      // Reset manual flag after updating sync, so other groups can react
      manualSelectionRef.current = false;
    }
  };

  const activeLabel = normalizedLabels[activeIndex];

  return (
    <Tabs.Root
      className="code-group my-6"
      value={String(activeIndex)}
      onValueChange={value => handleSelect(Number(value))}
      data-active-label={activeLabel?.text ?? ''}
    >
      <Tabs.List className="not-prose flex flex-wrap gap-2 rounded-t-lg border border-border/60 bg-accent/30 px-3 py-2.5 text-sm font-medium">
        {normalizedLabels.map(({text}, index) => (
          <Tabs.Trigger
            key={`${text}-${index}`}
            value={String(index)}
            className={clsx(
              'rounded-md px-3 py-1 transition-colors',
              'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm',
              'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/50 data-[state=inactive]:hover:text-foreground',
            )}
          >
            {text}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="overflow-hidden rounded-b-lg border border-t-0 border-border/60 [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0">
        {isClient ? (
          codeBlocks.map((block, index) => (
            <Tabs.Content
              key={index}
              value={String(index)}
              className="rounded-b-lg code-group-content"
            >
              {block}
            </Tabs.Content>
          ))
        ) : (
          <div className="rounded-b-lg code-group-content">
            <CodeSkeleton lineCount={5} />
          </div>
        )}
      </div>
    </Tabs.Root>
  );
}
