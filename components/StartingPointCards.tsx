import {startingPoints} from '@/lib/starting-points';
import {ArrowRight, Clock} from 'lucide-react';
import Link from 'next/link';

export function StartingPointCards() {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      {startingPoints.map(point => (
        <article
          key={point.href}
          className="group relative flex min-h-52 flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-white/40 hover:shadow-md focus-within:ring-2 focus-within:ring-white/40 focus-within:ring-offset-2 focus-within:ring-offset-background"
        >
          <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-4">
              <h3 className="m-0 text-xl font-semibold tracking-tight text-foreground">
                {point.title}
              </h3>
              <ArrowRight
                aria-hidden="true"
                className="mt-1 text-sm font-medium text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-white"
                size={18}
                strokeWidth={2}
              />
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {point.description.map((segment, index) =>
                typeof segment === 'string' ? (
                  segment
                ) : (
                  <a
                    key={`${segment.href}-${index}`}
                    href={segment.href}
                    className="pointer-events-auto relative z-20 font-medium text-foreground underline decoration-white/60 underline-offset-4 hover:text-white"
                  >
                    {segment.text}
                  </a>
                ),
              )}
            </p>

            <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-foreground">
              <Clock
                aria-hidden="true"
                className="h-4 w-4 text-primary-highlight"
                size={16}
                strokeWidth={2}
              />
              <span>{point.duration}</span>
            </div>
          </div>

          <Link
            href={point.href}
            aria-label={`Open ${point.title}`}
            className="absolute inset-0 z-0 rounded-xl outline-none"
          />
        </article>
      ))}
    </div>
  );
}
