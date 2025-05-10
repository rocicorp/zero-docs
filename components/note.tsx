import {cn} from '@/lib/utils';
import clsx from 'clsx';
import {PropsWithChildren} from 'react';

type NoteProps = PropsWithChildren & {
  type?: 'note' | 'danger' | 'warning' | 'todo';
  emoji?: string;
  heading?: string;
};

export default function Note({
  children,
  type = 'note',
  emoji,
  heading,
}: NoteProps) {
  const noteClassNames = clsx({
    'dark:bg-gray-900 dark:border-gray-800 bg-blue-50 border-blue-200':
      type === 'note',
    'dark:bg-yellow-950 dark:border-yellow-900 bg-yellow-50 border-yellow-200':
      type === 'warning' || type === 'todo',
    'dark:bg-red-950 dark:border-red-900 bg-red-50 border-red-200':
      type === 'danger',
  });

  // Default emojis by note type
  const typeEmojis: Record<'note' | 'warning' | 'danger' | 'todo', string> = {
    note: '🤔',
    warning: '😬',
    danger: '😱',
    todo: '😅',
  };

  // Default headings by note type
  const defaultHeadings: Record<
    'note' | 'warning' | 'danger' | 'todo',
    string
  > = {
    note: 'Note',
    warning: 'Warning',
    danger: 'Danger',
    todo: 'TODO',
  };

  // Use the overridden emoji if provided; otherwise, use the default
  const displayedEmoji = emoji || typeEmojis[type];

  // Use the overridden heading if provided; otherwise, use the default
  const displayedHeading = heading || defaultHeadings[type];

  return (
    <div
      className={cn(
        'note-container border rounded-md p-3.5 text-sm tracking-wide items-start',
        noteClassNames,
      )}
    >
      <div className="note-heading-container flex items-center mb-2">
        <span className="note-emoji">{displayedEmoji}</span>
        <span className="note-heading">{displayedHeading}</span>
      </div>
      <aside className="note-aside">{children}</aside>
    </div>
  );
}
