'use client';

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
import {cn} from '@/lib/utils';
import searchIndex from '@/assets/search-index.json';
import {CommandIcon, SearchIcon} from 'lucide-react';
import lunr from 'lunr';
import {useRouter} from 'next/navigation';
import React, {useEffect, useState} from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import Kbd from './ui/kbd';

const Anchor = React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
  ({children, ...props}, ref) => {
    return (
      <a ref={ref} {...props}>
        {children}
      </a>
    );
  },
);
Anchor.displayName = 'Anchor';

// Define the type for a search document
interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  icon: IconKey;
  headings: {text: string; id: string}[];
}

interface SearchResult extends SearchDocument {
  snippet?: string;
  snippetId?: string;
}

function extractSnippet(
  content: string,
  searchTerm: string,
  snippetLength = 100,
): string {
  const lowerContent = content.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);

  if (index === -1) return content.substring(0, snippetLength) + '...';

  const start = Math.max(index - snippetLength / 2, 0);
  const end = Math.min(start + snippetLength, content.length);

  let snippet = content.substring(start, end);

  // Highlight the search term in the snippet
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  snippet = snippet.replace(regex, '<mark>$1</mark>');

  return `...${snippet}...`;
}

const searchDocs = Array.isArray(searchIndex)
  ? (searchIndex as SearchDocument[])
  : [];

export default function Search() {
  const [searchedInput, setSearchedInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lunrIndex, setLunrIndex] = useState<lunr.Index | null>(null);

  const router = useRouter();

  // Load search index on component mount
  useEffect(() => {
    // Create Lunr index
    const newLunrIndex = lunr(b => {
      b.ref('id');
      b.field('title', {boost: 10}); // Prioritize document title
      b.field('content');
      b.field('headings', {boost: 9}); // Prioritize headings

      for (const doc of searchDocs) {
        b.add({
          ...doc,
          title: doc.title?.toLowerCase() ?? '',
          headings: doc.headings.map(h => h.text.toLowerCase()).join(' '), // Convert headings to searchable string
        });
      }
    });

    setLunrIndex(newLunrIndex);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!lunrIndex) {
        setSearchResults([]);
        return;
      }

      const sanitizedInput = searchedInput.trim();
      if (sanitizedInput.length === 0) {
        setSearchResults([]);
        return;
      }

      const escapeSpecialChars = (text: string) =>
        text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

      const words = sanitizedInput
        .toLowerCase()
        .split(' ')
        .map(escapeSpecialChars);

      const query = words
        .map(word => `${word}* ${word}`) // Match both wildcard and exact words
        .join(' ');

      try {
        const results = lunrIndex.search(query).map(({ref}) => {
          const doc = searchDocs.find(d => d.id === ref);
          if (!doc) return null;

          let snippet = extractSnippet(doc.content, sanitizedInput);

          const snippetIndex = doc.content
            .toLowerCase()
            .indexOf(sanitizedInput.toLowerCase());

          // Ensure a valid snippet index is found
          if (snippetIndex === -1) {
            return {
              ...doc,
              snippet,
              snippetId: doc.headings.length > 0 ? doc.headings[0].id : '',
            };
          }

          // Find the closest heading before or at the snippet position
          const validHeadings = doc.headings
            .map(heading => ({
              ...heading,
              index: doc.content.indexOf(heading.text),
            }))
            .filter(heading => heading.index !== -1) // Ensure valid headings
            .sort((a, b) => a.index - b.index); // Sort headings in document order

          let closestHeading = null;

          // Iterate through the headings and find the best match
          for (let i = 0; i < validHeadings.length; i++) {
            if (validHeadings[i].index > snippetIndex) {
              break; // Stop at the first heading after the snippet
            }
            closestHeading = validHeadings[i]; // Keep updating until we reach the last valid one
          }

          // If no heading before, pick the first heading after the snippet
          const finalHeading =
            closestHeading ??
            validHeadings.find(h => h.index > snippetIndex) ??
            doc.headings[0];

          return {...doc, snippet, snippetId: finalHeading?.id || ''};
        });

        // Add an extra result if the search term exactly matches a document title
        const exactMatch = searchDocs.find(
          doc => doc.title.toLowerCase() === sanitizedInput.toLowerCase(),
        );

        if (exactMatch) {
          results.unshift({
            ...exactMatch,
            snippet: '',
            snippetId: ' ', // Ensures no hash fragment is appended for exact document match
          });
        }

        // Deduplicate results by ID
        const uniqueResults = results.filter(Boolean).reduce((acc, result) => {
          if (!acc.has(result!.id)) {
            acc.set(result!.id, result!);
          }
          return acc;
        }, new Map<string, SearchResult>());

        setSearchResults(Array.from(uniqueResults.values()));
      } catch (error) {
        console.error('Lunr.js Query Error:', error);
        setSearchResults([]);
      }
    }, 20);

    return () => clearTimeout(delayDebounce);
  }, [searchedInput]);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) setSearchedInput('');
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <div className="relative max-w-56 px-2.5 py-0.5 flex items-center gap-2 md:border rounded-md cursor-pointer h-10 bg-transparent md:bg-background focus-within:ring-2 focus-within:ring-primary hover:bg-accent md:hover:bg-background">
          <SearchIcon className="h-4 w-5 flex-shrink-0 aspect-square text-foreground" />
          <Input
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
        className={cn('overflow-hidden p-0')}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search..."
            value={searchedInput}
            onValueChange={setSearchedInput}
            showCloseButton={true}
          />
          <CommandList showBorder={Boolean(searchedInput)}>
            {searchedInput && <CommandEmpty>No results found.</CommandEmpty>}
            {searchResults.length > 0 && (
              <CommandGroup className="p-0">
                {searchResults.map(item => {
                  const Icon = icons[item?.icon ?? 'FileCode'];

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        setIsOpen(false);
                        setSearchedInput('');
                        setSearchResults([]);
                        const url = item.snippetId
                          ? `${item.url}#${item.snippetId}`
                          : item.url;
                        router.push(url);
                      }}
                      className={cn(
                        'flex flex-col items-start gap-2 py-3 px-4 rounded-none',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.snippet && (
                        <p
                          className="text-xs text-muted-foreground"
                          dangerouslySetInnerHTML={{__html: item.snippet}}
                        />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
