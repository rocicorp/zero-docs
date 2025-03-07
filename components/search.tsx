'use client';

import {useEffect, useMemo, useState} from 'react';
import lunr from 'lunr';
import {CommandIcon, FileIcon, SearchIcon} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import Anchor from './anchor';
import {ScrollArea} from '@/components/ui/scroll-area';

// Define the type for a search document
interface SearchDocument {
  id: string;
  title: string;
  folderName: string;
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

  // Load search index on component mount
  useEffect(() => {
    async function loadSearchIndex() {
      const response = await fetch('/search-index.json');
      searchDocs = await response.json();

      // Create Lunr index
      lunrIndex = lunr(function () {
        this.ref('id');
        this.field('title', {boost: 10}); // Prioritize document title
        this.field('folderName', {boost: 8}); // Prioritize folder name
        this.field('content');

        searchDocs.forEach(doc => {
          this.add({
            ...doc,
            title: doc.title ? doc.title.toLowerCase() : '',
            folderName: doc.folderName ? doc.folderName.toLowerCase() : '', // Ensure folder name is indexed
          });
        });
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

          const snippetIndex = doc.content.indexOf(snippet);

          // Find the heading closest to or after the snippet position
          const closestHeading =
            doc.headings.length > 0
              ? doc.headings
                  .map(heading => ({
                    text: heading.text,
                    id: heading.id,
                    index: doc.content.indexOf(heading.text),
                  }))
                  .filter(heading => heading.index !== -1) // Remove invalid headings
                  .sort((a, b) => a.index - b.index) // Sort headings in document order
                  .reduce(
                    (closest, heading) => {
                      if (!closest || heading.index >= snippetIndex)
                        return heading; // Prefer heading after snippet
                      return heading.index > closest.index ? heading : closest; // Otherwise, get nearest before
                    },
                    {
                      ...doc.headings[0],
                      index: doc.content.indexOf(doc.headings[0].text),
                    },
                  )
              : null;

          return {
            ...doc,
            snippet,
            snippetId: closestHeading?.id || '',
          };
        });

        setSearchResults(results.filter(Boolean) as SearchResult[]);
      } catch (error) {
        console.error('Lunr.js Query Error:', error);
        setSearchResults([]);
      }
    }, 200); // Debounce time: 200ms

    return () => clearTimeout(delayDebounce);
  }, [searchedInput]);

  // Listen for CMD+K (Mac) or CTRL+K (Windows) and keyboard navigation when search dialog is open
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setHighlightIndex(prev =>
            Math.min(prev + 1, searchResults.length - 1),
          );
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setHighlightIndex(prev => Math.max(prev - 1, 0));
        } else if (event.key === 'Enter' && searchResults[highlightIndex]) {
          event.preventDefault();
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
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={open => {
          if (!open) setSearchedInput('');
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <div className="search-container relative flex-1 max-w-md cursor-pointer">
            <div className="search-icon-container">
              <SearchIcon className="search-icon absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 dark:text-stone-400" />
            </div>
            <Input
              className="search-input md:w-full rounded-md dark:bg-background/95 bg-background border h-9 pl-10 pr-0 sm:pr-7 text-sm shadow-sm overflow-ellipsis"
              placeholder="Search docs"
              type="search"
              value={searchedInput}
              onChange={e => setSearchedInput(e.target.value)}
            />
            <div className="search-shortcut hidden absolute top-1/2 -translate-y-1/2 right-2 text-xs font-medium font-mono items-center gap-0.5 dark:bg-stone-900 bg-stone-200/65 p-1 rounded-sm">
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

          <ScrollArea className="max-h-[400px] overflow-y-auto">
            <div className="flex flex-col items-start overflow-y-auto sm:px-2 px-1 pb-4">
              {searchResults.map((item, index) => (
                <DialogClose key={item.id} asChild>
                  <Anchor
                    className={`w-full ${index === highlightIndex ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    href={`${item.url}#${item.snippetId || item.headings[0]?.id}`}
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
    </div>
  );
}
