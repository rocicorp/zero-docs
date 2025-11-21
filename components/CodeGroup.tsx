'use client';

import {
  Children,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import {useCodeGroupSync} from '@/components/code-group-provider';
import {CodeGroupSyncMap, normalizeSyncMap} from '@/lib/code-group-sync';

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
};

export default function CodeGroup({labels = [], children}: CodeGroupProps) {
  const codeBlocks = useMemo(() => {
    return Children.toArray(children).filter(child => {
      if (typeof child === 'string') {
        return false;
      }
      return Boolean(child);
    }) as ReactElement[];
  }, [children]);

  const normalizedLabels = useMemo(() => {
    return codeBlocks.map((_, index) => normalizeLabel(labels[index], index));
  }, [codeBlocks, labels]);

  const {selection, updateSelection} = useCodeGroupSync();

  const initialMatchRef = useRef<number | null>(null);
  if (initialMatchRef.current === null) {
    initialMatchRef.current = findBestMatch(normalizedLabels, selection);
  }

  const [activeIndex, setActiveIndex] = useState(() => {
    const initialMatch = initialMatchRef.current ?? -1;
    const boundedIndex =
      initialMatch >= 0 && initialMatch < codeBlocks.length ? initialMatch : 0;
    return boundedIndex;
  });

  useEffect(() => {
    setActiveIndex(current => (current >= codeBlocks.length ? 0 : current));
  }, [codeBlocks.length]);

  useEffect(() => {
    if (!normalizedLabels.length) return;
    const matchIndex = findBestMatch(normalizedLabels, selection);
    if (matchIndex !== -1 && matchIndex !== activeIndex) {
      setActiveIndex(matchIndex);
    }
  }, [normalizedLabels, selection, activeIndex]);

  if (!codeBlocks.length) {
    return null;
  }

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    const selectedLabel = normalizedLabels[index];
    if (Object.keys(selectedLabel.sync).length) {
      updateSelection(selectedLabel.sync);
    }
  };

  const activeLabel = normalizedLabels[activeIndex];

  return (
    <div
      className="code-group my-6"
      data-active-label={activeLabel?.text ?? ''}
    >
      <div
        className="not-prose flex flex-wrap gap-2 rounded-t-lg border border-border/60 bg-accent/30 px-3 py-2.5 text-sm font-medium"
        role="tablist"
      >
        {normalizedLabels.map(({text}, index) => (
          <button
            type="button"
            key={`${text}-${index}`}
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => handleSelect(index)}
            className={clsx(
              'rounded-md px-3 py-1 transition-colors',
              index === activeIndex
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-b-lg border border-t-0 border-border/60 [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0">
        {codeBlocks.map((block, index) => (
          <div
            key={index}
            className={clsx(
              index === activeIndex ? 'block' : 'hidden',
              'rounded-b-lg'
            )}
            role="tabpanel"
          >
            {block}
          </div>
        ))}
      </div>
    </div>
  );
}
