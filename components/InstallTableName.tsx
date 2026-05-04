'use client';

import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';

const DEFAULT_TABLE_NAME = 'user';

type InstallTableNameContextValue = {
  inputValue: string;
  setInputValue: (value: string) => void;
  names: {
    tableName: string;
    queryName: string;
    resultName: string;
    mutatorName: string;
  };
};

const InstallTableNameContext =
  createContext<InstallTableNameContextValue | null>(null);

function sanitizeTableName(value: string) {
  const collapsed = value
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_$]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!collapsed) {
    return '';
  }

  return collapsed.replace(/^[0-9]/, match => `_${match}`);
}

function splitIdentifierWords(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[_\s-]+/)
    .map(part => part.trim())
    .filter(Boolean);
}

function pluralizeWord(word: string) {
  const lower = word.toLowerCase();

  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return `${word}es`;
  }

  if (/[^aeiou]y$/i.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }

  if (lower.endsWith('s') && !/(ss|us|is)$/.test(lower)) {
    return word;
  }

  return `${word}s`;
}

function pluralizeIdentifier(value: string) {
  const words = splitIdentifierWords(value);
  if (words.length === 0) {
    return value;
  }

  const separator = value.includes('_') ? '_' : '';
  const nextWords = [...words];
  nextWords[nextWords.length - 1] = pluralizeWord(nextWords.at(-1) ?? '');

  if (separator) {
    return nextWords.join(separator);
  }

  return nextWords
    .map((word, index) =>
      index === 0 ? word : `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`,
    )
    .join('');
}

function toPascalCase(value: string) {
  return splitIdentifierWords(value)
    .map(word => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`)
    .join('');
}

function toCamelCase(value: string) {
  const words = splitIdentifierWords(value);
  if (words.length === 0) {
    return value;
  }

  const [first, ...rest] = words;

  return [
    first[0]?.toLowerCase()
      ? `${first[0].toLowerCase()}${first.slice(1)}`
      : first,
    ...rest.map(word => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`),
  ].join('');
}

function getNames(inputValue: string) {
  const tableName = sanitizeTableName(inputValue) || DEFAULT_TABLE_NAME;
  const pluralTableName = pluralizeIdentifier(tableName);

  return {
    tableName,
    queryName: `all${toPascalCase(pluralTableName)}`,
    resultName: toCamelCase(pluralTableName),
    mutatorName: `activate${toPascalCase(tableName)}`,
  };
}

function useInstallTableName() {
  const context = useContext(InstallTableNameContext);

  if (!context) {
    throw new Error(
      'InstallTableName components must be used within InstallTableNameProvider.',
    );
  }

  return context;
}

function replaceInstallTableText(
  value: string,
  replacements: Record<string, string>,
) {
  return value
    .replace(/\ballUsers\b/g, replacements.queryName)
    .replace(/\bactivateUser\b/g, replacements.mutatorName)
    .replace(/\busers\b/g, replacements.resultName)
    .replace(/\buser\b/g, replacements.tableName);
}

function replaceNodeText(
  node: ReactNode,
  replacements: Record<string, string>,
): ReactNode {
  if (typeof node === 'string') {
    return replaceInstallTableText(node, replacements);
  }

  if (Array.isArray(node)) {
    return node.map(child => replaceNodeText(child, replacements));
  }

  if (!isValidElement<{children?: ReactNode}>(node)) {
    return node;
  }

  if (node.props.children === undefined) {
    return node;
  }

  const nextChildren = Children.map(node.props.children, child =>
    replaceNodeText(child, replacements),
  );

  return cloneElement(
    node as ReactElement<{children?: ReactNode}>,
    undefined,
    nextChildren,
  );
}

export function InstallTableNameProvider({children}: {children: ReactNode}) {
  const [inputValue, setInputValue] = useState(DEFAULT_TABLE_NAME);

  const value = useMemo(
    () => ({
      inputValue,
      setInputValue,
      names: getNames(inputValue),
    }),
    [inputValue],
  );

  return (
    <InstallTableNameContext.Provider value={value}>
      {children}
    </InstallTableNameContext.Provider>
  );
}

export function InstallTableNameInput({children}: {children?: ReactNode}) {
  const {inputValue, setInputValue} = useInstallTableName();
  const inputId = useId();
  const childText =
    typeof children === 'string' ? children : DEFAULT_TABLE_NAME;
  const displayValue = inputValue || childText;

  return (
    <span className="inline-flex items-center gap-2 align-baseline">
      <label className="sr-only" htmlFor={inputId}>
        Table name
      </label>
      <span className="not-prose inline-flex items-center rounded-md border border-border/60 bg-neutral-100 px-1.5 py-0.5 font-code text-[0.95em] leading-[1.35] text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
        <Input
          id={inputId}
          value={inputValue}
          onChange={event =>
            setInputValue(sanitizeTableName(event.target.value))
          }
          placeholder={childText}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            'h-auto min-w-[4ch] border-0 bg-transparent p-0 font-code text-[0.95em] leading-[1.35] text-inherit shadow-none ring-0 placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:placeholder:text-neutral-400',
          )}
          style={{
            width: `${Math.max(displayValue.length, childText.length, 4) + 0.35}ch`,
          }}
        />
      </span>
    </span>
  );
}

export function InstallTableNameReplace({children}: {children: ReactNode}) {
  const {names} = useInstallTableName();

  return <>{replaceNodeText(children, names)}</>;
}
