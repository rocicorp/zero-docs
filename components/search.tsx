'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {CommandIcon, FileIcon, SearchIcon} from 'lucide-react';
import lunr from 'lunr';
import React, {useEffect, useRef, useState} from 'react';
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
  headings: {
    text: string;
    id: string;
  }[];
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

// Store Lunr index & search data globally (to avoid rebuilding on each render)
let lunrIndex: lunr.Index | null = null;
let searchDocs: SearchDocument[] = [];

export default function Search() {
  const [searchedInput, setSearchedInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Load search index on component mount
  useEffect(() => {
    async function loadSearchIndex() {
      const response = await fetch('/search-index.json');
      searchDocs = await response.json();

      // Create Lunr index
      lunrIndex = lunr(b => {
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
    }

    if (!lunrIndex) {
      loadSearchIndex();
    }
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

          return {
            ...doc,
            snippet,
            snippetId: finalHeading?.id || '',
          };
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

        setSearchResults(results.filter(Boolean) as SearchResult[]);
      } catch (error) {
        console.error('Lunr.js Query Error:', error);
        setSearchResults([]);
      }
    }, 200); // Debounce time: 200ms

    return () => clearTimeout(delayDebounce);
  }, [searchedInput]);

  // Reset highlight index on new search
  useEffect(() => {
    setHighlightIndex(0);
  }, [searchedInput]);

  // Ensure the active search result scrolls into view when highlighted
  useEffect(() => {
    if (
      isOpen &&
      resultRefs.current[highlightIndex] &&
      scrollContainerRef.current
    ) {
      const selectedItem = resultRefs.current[highlightIndex];
      const container = scrollContainerRef.current;

      if (selectedItem && container) {
        const itemTop = selectedItem.offsetTop;
        const itemHeight = selectedItem.offsetHeight;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        // If the selected item is above the visible area, scroll up
        if (itemTop < containerScrollTop) {
          container.scrollTo({top: itemTop, behavior: 'smooth'});
        }
        // If the selected item is below the visible area, scroll down
        else if (itemTop + itemHeight > containerScrollTop + containerHeight) {
          container.scrollTo({
            top: itemTop + itemHeight - containerHeight,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [highlightIndex, isOpen]);

  // Listen for CMD+K (Mac) or CTRL+K (Windows) and keyboard navigation when search dialog is open
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setHighlightIndex(prev => (prev + 1) % searchResults.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setHighlightIndex(prev =>
            prev > 0 ? prev - 1 : searchResults.length - 1,
          );
        } else if (
          event.key === 'Enter' &&
          searchResults[highlightIndex] != null
        ) {
          event.preventDefault();
          setIsOpen(false); // Close search dialog
          window.location.href = `${searchResults[highlightIndex].url}#${searchResults[highlightIndex].snippetId || searchResults[highlightIndex].headings[0]?.id}`;
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightIndex, searchResults]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) setSearchedInput('');
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <div className="relative max-w-56 px-2.5 py-0.5 flex items-center gap-2 md:border rounded-md scursor-pointer h-10 bg-transparent md:bg-background focus-within:ring-2 focus-within:ring-primary hover:bg-accent md:hover:bg-background">
          <SearchIcon className="h-4 w-5 flex-shrink-0 aspect-square text-foreground" />
          <Input
            className="hidden md:block bg-transparent text-sm px-0 overflow-ellipsis border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search docs"
            type="search"
            value={searchedInput}
            onChange={e => setSearchedInput(e.target.value)}
          />
          <div className="hidden md:flex flex-shrink-0 text-xs font-medium font-mono items-center gap-0.5 dark:bg-stone-900 bg-stone-200/65 p-1 rounded-sm">
            <CommandIcon className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="dialog-container p-0 max-w-[650px] sm:top-[38%] top-[45%] !rounded-md">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogHeader>
          <input
            value={searchedInput}
            onChange={e => setSearchedInput(e.target.value)}
            placeholder="Type something to search..."
            autoFocus
            className="h-14 px-6 bg-transparent border-b text-[14px] outline-none"
          />
        </DialogHeader>

        {searchResults.length === 0 && searchedInput && (
          <p className="text-muted-foreground mx-auto mt-2 text-sm">
            No results found for{' '}
            <span className="text-primary">"{searchedInput}"</span>
          </p>
        )}

        <ScrollArea
          ref={scrollContainerRef}
          className="max-h-[400px] overflow-y-auto"
        >
          <div className="flex flex-col items-start overflow-y-auto sm:px-2 px-1 pb-4">
            {searchResults.map((item, index) => (
              <DialogClose key={item.id} asChild>
                <Anchor
                  ref={(el: HTMLAnchorElement | null) => {
                    resultRefs.current[index] = el;
                  }}
                  className={`w-full ${index === highlightIndex ? 'bg-gray-200 dark:bg-gray-700 search-selected' : ''}`}
                  href={
                    item.snippetId ? `${item.url}#${item.snippetId}` : item.url
                  }
                  onClick={() => setIsOpen(false)} // Close the search dialog
                >
                  <div className="flex items-center w-fit h-full py-3 gap-1.5 px-2">
                    <FileIcon className="h-[1.1rem] w-[1.1rem] mr-1" />{' '}
                    {item.title}
                  </div>
                  {item.snippet && (
                    <p
                      className="search-snippet text-xs text-muted-foreground px-3"
                      dangerouslySetInnerHTML={{__html: item.snippet}}
                    />
                  )}
                </Anchor>
              </DialogClose>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
