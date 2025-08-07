'use client';

import CodeBlock from '@/components/CodeBlock';
import RocicorpLogo from '@/components/logos/Rocicorp';
import ZeroAlphaLogo from '@/components/logos/ZeroAlpha';
import {Button} from '@/components/ui/button';
import ResponsiveImage from '@/components/ui/responsive-image';
import {cn} from '@/lib/utils';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/docs/');
  }, [router]);

  const exampleCode = `function Playlist({id}: {id: string}) {
  // This usually resolves *instantly*, and updates reactively
  // as server data changes. Just wire it directly to your UI –
  // no HTTP APIs, no state management no realtime goop.
  const [playlist] = useQuery(
    zero.query.playlist
      .related('tracks', track => track
        .related('album')
        .related('artist')
        .orderBy('playcount', 'asc'))
      .where('id', id)
      .one()
  );

  const onStar = (id: string, starred: boolean) => {
    zero.mutate.track.update({
      id,
      starred,
    });
  }

  if (!playlist) return null;

  return (
    <>
      <div>{playlist.name}</div>
      <div>
        {playlist.tracks.map(track => (
          <TrackRow key={track.id} track={track} onStar={onStar}/>
        ))}
      </div>
    </>
  );
}`;

  return (
    <div className={styles.main}>
      <div className={styles.mainHeader}>
        <ZeroAlphaLogo
          width={173}
          height={32}
          className={cn(styles.logo, 'text-foreground')}
        />

        <div className={styles.navLinks}>
          <Button
            className="flex items-center gap-2"
            variant="primary"
            size="default"
            asChild
          >
            <a href="https://github.com/rocicorp/mono#zero">GitHub</a>
          </Button>

          <Button
            variant="primary"
            className="flex items-center gap-2"
            size="default"
            asChild
          >
            <Link href="/docs/">Docs</Link>
          </Button>
        </div>
      </div>

      {/* Intro */}
      <p>Developing web applications has gotten insanely complex.</p>
      <p>
        You need a tall pile of tech to build a &quot;modern&quot; web app:
        client-side code, server-side code, APIs to tie them together, data
        fetching, state management, hydration, websockets for reactivity, and a
        whole lot more. And once you&apos;re done, the resulting app still
        isn&apos;t very good.
      </p>
      <p>It&apos;s time for a rethink.</p>
      <p>
        We&apos;re building an open-source, general-purpose sync engine for the
        web. You put Zero in front of your database and web server, and we
        distribute your backend all the way to main thread of the UI.
      </p>

      {/* Zero Diagram */}
      <ResponsiveImage
        className="invert dark:invert-0"
        src="/images/how-it-works.svg"
        alt="How Zero Works"
        width={731}
        height={176}
      />

      <p>
        You get a client-side API that <em>looks</em> like an embedded db, but
        to which you can issue arbitrary <em>hybrid queries</em> that span the
        entire database, including the server.
      </p>
      <p>
        Behind the scenes, we synchronize queries results continuously to a
        client-side persistent cache. This cache is used automatically for
        future queries whenever possible.
      </p>

      {/* Code Block */}
      <CodeBlock code={exampleCode} language="typescript" />

      <p>This architecture provides:</p>

      <ul>
        <li>
          <strong>Instant</strong> (zero milliseconds) response for almost all
          user interactions &ndash; the user taps a button and the UI instantly
          updates, in the next frame.
        </li>
        <li>
          <strong>Automatic reactivity</strong> &ndash; a user changes something
          and all other users see the change live.
        </li>
        <li>
          <strong>Dramatically faster</strong> development velocity &ndash;
          almost all features can be built completely client-side, with no need
          for new server-side APIs to be built and deployed.
        </li>
        <li>
          <strong>Scalability</strong> &ndash; Zero can work with any amount of
          backend data. It doesn&apos;t require syncing all data to the client
          up-front, or knowing which data you&apos;ll need ahead of time. If the
          app needs data which hasn&apos;t already been synced, it is synced on
          demand.
        </li>
      </ul>

      <p>
        Where Zero really shines is complex, highly-interactive applications
        like Linear and Superhuman. With Zero, these apps can be built in a
        fraction of the time it would take to build even an old-fashioned
        server-rendered web app.
      </p>
      <p>
        Zero is currently in public alpha. It&apos;s got a few rough edges, and
        you have to deploy it yourself, but it&apos;s already remarkably fun.
        We&apos;re using it ourselves for Zero&apos;s{' '}
        <a className="underline" href="https://bugs.rocicorp.dev/">
          official bug tracker
        </a>{' '}
        and we find it much more productive than the alternatives.
      </p>
      <p>
        Ready to start? You can have your first app in production in about 20
        minutes.
      </p>
      <br />
      <div className="flex w-full justify-center">
        <Button variant="primary" size="default" asChild>
          <Link href="/docs/">Get Started Now</Link>
        </Button>
      </div>

      <div className={styles.footer}>
        <Link href="https://roci.dev">
          <RocicorpLogo
            width={86}
            height={116}
            className={cn(styles.rociLogo, 'text-foreground')}
          />
        </Link>
      </div>
    </div>
  );
}
