'use client';

import searchIndex from '@/assets/search-index.json';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {IconKey, icons} from '@/lib/icons';
import {
  createLunrIndex,
  searchDocuments,
  type SearchResult,
} from '@/lib/search';
import type {SearchDocument} from '@/lib/search-types';
import {cn} from '@/lib/utils';
import {useCommandState} from 'cmdk';
import {CommandIcon, SearchIcon} from 'lucide-react';
import {useRouter} from 'next/navigation';
import React, {useEffect, useMemo, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDebounce} from 'use-debounce';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import Kbd from './ui/kbd';
import Link from 'next/link';

const rawDocs = Array.isArray(searchIndex)
  ? (searchIndex as unknown as Partial<SearchDocument>[])
  : [];

const searchDocs: SearchDocument[] = rawDocs.map(doc => ({
  id: doc.id ?? '',
  title: doc.title ?? doc.sectionTitle ?? '',
  searchTitle: doc.searchTitle ?? doc.sectionTitle ?? doc.title ?? '',
  content: doc.content ?? '',
  url: doc.url ?? '',
  headings: doc.headings ?? [],
  kind: doc.kind ?? 'page',
  sectionTitle: doc.sectionTitle,
  sectionId: doc.sectionId,
  icon: doc.icon,
}));

export default function Search() {
  const [searchedInput, setSearchedInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [lunrIndex, setLunrIndex] = useState<ReturnType<
    typeof createLunrIndex
  > | null>(null);
  const trimmedInput = searchedInput.trim();
  const [debouncedInput] = useDebounce(trimmedInput, 120, {maxWait: 300});

  const router = useRouter();

  useEffect(() => {
    setLunrIndex(createLunrIndex(searchDocs));
  }, []);

  useEffect(() => {
    if (!lunrIndex) {
      setSearchResults([]);
      return;
    }

    if (debouncedInput.length === 0) {
      setSearchResults([]);
      setSelectedValue('');
      return;
    }

    try {
      setSearchResults(
        searchDocuments({
          index: lunrIndex,
          documents: searchDocs,
          query: debouncedInput,
        }),
      );
    } catch (error) {
      console.error('Lunr.js Query Error:', error);
      setSearchResults([]);
    }
  }, [debouncedInput, lunrIndex]);

  useEffect(() => {
    setSelectedValue('');
    if (!trimmedInput) {
      setSearchResults([]);
    }
  }, [trimmedInput]);

  const handleFallbackSelect = () => {
    const firstResult = searchResults[0];
    if (!firstResult) return;

    setIsOpen(false);
    setSearchedInput('');
    setSearchResults([]);
    setSelectedValue('');
    router.push(firstResult.composedUrl);
  };

  // Toggle the menu when ⌘K is pressed
  useHotkeys(
    'mod+k',
    e => {
      e.preventDefault();
      setIsOpen(open => !open);
    },
    {enableOnFormTags: true, enableOnContentEditable: true},
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) setSearchedInput('');
        if (!open) setSelectedValue('');
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <div className="relative max-w-56 px-2.5 py-0.5 flex items-center gap-2 md:border rounded-md cursor-pointer h-10 bg-transparent md:bg-background focus-within:ring-2 focus-within:ring-primary hover:bg-accent md:hover:bg-background">
          <SearchIcon className="h-4 w-5 flex-shrink-0 aspect-square text-foreground" />
          <Input
            name="search"
            className="hidden md:block bg-transparent text-sm px-0 overflow-ellipsis border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search docs"
            type="search"
            value={searchedInput}
            onChange={e => setSearchedInput(e.target.value)}
          />
          <Kbd className="hidden md:flex">
            <CommandIcon className="w-2.5 h-2.5" />
            <span>K</span>
          </Kbd>
        </div>
      </DialogTrigger>

      <DialogHeader className="sr-only">
        <DialogTitle>Search</DialogTitle>
        <DialogDescription>
          Search the contents of the documentation for Zero
        </DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className={cn('overflow-hidden p-0 top-32 translate-y-0')}
      >
        <Command
          loop
          shouldFilter={false}
          value={selectedValue}
          onValueChange={setSelectedValue}
        >
          <CommandInput
            placeholder="Type to search..."
            value={searchedInput}
            onValueChange={setSearchedInput}
            showCloseButton={true}
            onKeyDown={event => {
              if (event.key !== 'Enter') return;
              if (selectedValue) return;
              if (!searchResults.length) return;
              event.preventDefault();
              handleFallbackSelect();
            }}
          />
          <CommandList showBorder={Boolean(searchedInput)}>
            {searchedInput && <CommandEmpty>No results found.</CommandEmpty>}
            {searchResults.length > 0 && (
              <CommandGroup className="p-0">
                {searchResults.map(item => {
                  const iconKey = (item.icon ?? 'FileCode') as IconKey;
                  const Icon = icons[iconKey];
                  const primaryTitle = item.sectionTitle ?? item.title;
                  const secondaryTitle = item.sectionTitle ? item.title : null;

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        setIsOpen(false);
                        setSearchedInput('');
                        setSearchResults([]);
                        router.push(item.composedUrl);
                      }}
                      className={cn(
                        'flex flex-col items-start gap-2 py-3 px-4 rounded-none',
                      )}
                      asChild
                    >
                      <Link href={item.composedUrl}>
                        <div className="flex items-center gap-2">
                          <div>
                            <Icon />
                          </div>
                          <span className="font-medium">
                            {secondaryTitle ? `${secondaryTitle}: ` : ''}
                            {primaryTitle}
                          </span>
                        </div>

                        {item.snippet && (
                          <p
                            className="text-xs text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{__html: item.snippet}}
                          />
                        )}
                      </Link>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
          <PreloadCurrentItem />
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const PreloadCurrentItem = () => {
  const value = useCommandState(state => state.value);
  const router = useRouter();

  const activeItem = useMemo(() => {
    return searchDocs.find(item => item.id === value);
  }, [value]);

  useEffect(() => {
    if (activeItem) {
      router.prefetch(activeItem.url);
    }
  }, [activeItem, router]);

  return <></>;
};
