import {IntroductionLanding} from '@/components/IntroductionLanding';
import {Metadata} from 'next';
import {parseMdx} from '@/lib/mdx';

const title = 'Zero';
const description = 'Instant Queries By Default';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: `/api/og?title=${encodeURIComponent('Instant Queries\nBy Default')}&logo=zero`,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: `/api/og?title=${encodeURIComponent('Instant Queries\nBy Default')}&logo=zero`,
  },
};

export default async function Home() {
  const app = await parseMdx(`~~~tsx
import {queries} from 'queries.ts'
import {mutators} from 'mutators.ts'

function Playlist({id}: {id: string}) {
  // This usually resolves *instantly*, and updates reactively
  // as server data changes. Just wire it directly to your UI –
  // no HTTP APIs, no state management, no realtime goop.
  const [playlist] = useQuery(
    queries.playlist.byID({id})
  )

  const onStar = (id: string, starred: boolean) => {
    mutators.playlist.star({id, starred})
  }

  // render playlist...
}
~~~`);

  const appMobileFriendly = await parseMdx(`~~~tsx
import {queries} from 'queries.ts'
import {mutators} from 'mutators.ts'

function Playlist({id}: {id: string}) {
  // This usually resolves *instantly*,
  // and updates reactively as server
  // data changes. Just wire it directly
  // to your UI – no HTTP APIs, no state
  // management, no realtime goop.
  const [playlist] = useQuery(
    queries.playlist.byID({id})
  )

  const onStar = (id: string, starred: boolean) => {
    mutators.playlist.star({id, starred})
  }

  // render playlist...
}
~~~`);

  const queries = await parseMdx(`~~~ts
import {defineQueries, defineQuery} from '@rocicorp/zero'
import {z} from 'zod'
import {zql} from './schema.ts'
 
export const queries = defineQueries({
  playlist: {
    byID: defineQuery(
      z.object({id: z.string()}),
      ({args: {id}}) =>
        zql.playlist
          .related('tracks', track => track
            .related('album')
            .related('artist')
            .orderBy('playcount', 'asc'))
          .where('id', id)
          .one()
    )
  }
})
~~~`);
  const queriesMobileFriendly = await parseMdx(`~~~ts
import {defineQueries, defineQuery} from '@rocicorp/zero'
import {z} from 'zod'
import {zql} from './schema.ts'
 
export const queries = defineQueries({
  playlist: {
    byID: defineQuery(
      z.object({id: z.string()}),
      ({args: {id}}) =>
        zql.playlist
          .related(
            'tracks',
            track =>
              track
                .related('album')
                .related('artist')
                .orderBy('playcount', 'asc')
          )
          .where('id', id)
          .one()
    )
  }
})
~~~`);
  const mutators = await parseMdx(`~~~ts
import {defineMutators, defineMutator} from '@rocicorp/zero'
import {z} from 'zod'
 
export const mutators = defineMutators({
  playlist: {
    star: defineMutator(
      z.object({
        id: z.string(),
        starred: z.boolean()
      }),
      async ({tx, args: {id, starred}}) => {
        await tx.mutate.track.update({id, starred});
      }
    )
  }
})
~~~`);

  return (
    <IntroductionLanding
      codeExamples={{
        app,
        appMobileFriendly,
        queries,
        queriesMobileFriendly,
        mutators,
        mutatorsMobileFriendly: mutators,
      }}
    />
  );
}
