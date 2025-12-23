import {cn} from '@/lib/utils';

function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

type CodeSkeletonProps = {
  lineCount?: number;
};

function CodeSkeleton({lineCount = 5}: CodeSkeletonProps) {
  return (
    <pre className="p-4">
      <code>
        {Array.from({length: lineCount}, (_, i) => {
          // Deterministic randomness, so react does not complain about hydration mismatch
          const isEmpty = (i + 1) % 9 === 0;
          const width = isEmpty ? 0 : 25 + ((i * 53 + 17) % 65);

          return (
            <Skeleton
              key={i}
              className="h-4 my-1 bg-gray-200"
              style={{
                width: `${width}%`,
                visibility: isEmpty ? 'hidden' : 'visible',
              }}
            />
          );
        })}
      </code>
    </pre>
  );
}

export {Skeleton, CodeSkeleton};
