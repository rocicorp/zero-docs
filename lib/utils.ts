import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {EachRoute, ROUTES} from './routes-config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to create slugs from text
export function sluggify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, ''); // Remove non-alphanumeric characters
}

export function helperSearch(
  query: string,
  node: EachRoute,
  prefix: string,
  currentLevel: number,
  maxLevel?: number,
) {
  const res: EachRoute[] = [];
  let parentHas = false;

  const nextLink = `${prefix}${node.href ?? ''}`;
  if (node.href && node.title.toLowerCase().includes(query.toLowerCase())) {
    res.push({...node, items: undefined, href: nextLink});
    parentHas = true;
  }
  const goNext = maxLevel ? currentLevel < maxLevel : true;
  if (goNext)
    node.items?.forEach(item => {
      const innerRes = helperSearch(
        query,
        item,
        nextLink,
        currentLevel + 1,
        maxLevel,
      );
      if (!!innerRes.length && !parentHas && node.href) {
        res.push({...node, items: undefined, href: nextLink});
        parentHas = true;
      }
      res.push(...innerRes);
    });
  return res;
}

export function advanceSearch(query: string) {
  return ROUTES.map(node =>
    helperSearch(query, node, '', 1, query.length == 0 ? 2 : undefined),
  ).flat();
}

// Thursday, May 23, 2024
export function formatDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', options);
}

//  May 23, 2024
export function formatDate2(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function stringToDate(date: string) {
  const [day, month, year] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}
