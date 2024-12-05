import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import ResponsiveImage from "@/components/ui/responsive-image";
import CodeBlock from "@/components/CodeBlock";

export default function Home() {
  // Code block

  const exampleCode = `function Playlist({id}: {id: string}) {
  // This usually resolves *instantly*, and updates reactively
  // as server data changes. Just wire it directly to your UI –
  // no HTTP APIs, no state management no realtime goop.
  const tracks = useQuery(
    zero.playlistTrack.join(zero.track).select(
      'track.*',
      ['album', track => track.queryAlbum().select('name')],
      ['artists', track => track.queryArtists().select('name')],
    )
    .where('playlistTrack.playlistID', '=', id)
    .orderBy('playlistTrack.order', 'asc')
    .limit(1000)
  );

  const onStar = (id: string, starred: boolean) => {
    zero.track.update({
      id,
      starred,
    });
  }

  return (
    <div>
      {tracks.map(track => (
        <TrackRow track={track} onStar={onStar}/>
      ))}
    </div>
  );
}`;

  return (
    <div className={styles.main}>
      <div className={styles.mainHeader}>
        <Image
          src="/images/zero-logo.svg"
          alt="Zero logo"
          className={styles.logo}
          width={117}
          height={32}
        />

        <Link href="/docs/welcome/introduction" className={styles.docsLink}>
          <button className={styles.docsButton}>Docs</button>
        </Link>
      </div>

      {/* Intro */}
      <p>Developing web applications has gotten insanely complex.</p>
      <p>
        You need a tall pile of tech to build a "modern" web app: client-side
        code, server-side code, APIs to tie them together, data fetching, state
        management, hydration, websockets for reactivity, and a whole lot more.
        And once you're done, the resulting app still isn't very good.
      </p>
      <p>It's time for a rethink.</p>
      <p>
        We’re building a general-purpose sync engine for the web. You put Zero
        in front of your existing database or web service, and we distribute
        your backend all the way to main thread of the UI.
      </p>

      {/* Zero Diagram */}
      <ResponsiveImage
        src="/images/how-it-works.svg"
        alt="How Zero Works"
        width={732}
        height={43}
      />

      <p>
        You get a client-side API that looks like an embedded db, but to which
        you can issue arbitrary <em>hybrid queries</em> that span the entire
        database, including the server.
      </p>
      <p>
        Behind the scenes, we synchronize the most frequently used 100MB of data
        to a client-side persistent cache. This cache is used automatically to
        the maximum extent possible for all queries.
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
          <strong>Automatic</strong> reactive queries &ndash; a user changes
          something and all other users see the change live.
        </li>
        <li>
          <strong>Dramatically faster</strong> development velocity &ndash;
          almost all features can be built completely client-side, with no need
          for new server-side APIs to be built and deployed.
        </li>
        <li>
          <strong>Scalability</strong> &ndash; Zero can work with any amount of
          backend data. It doesn't require syncing all data to the client
          up-front, or knowing which data you'll need ahead of time. If the app
          needs data which hasn't already been synced, it is synced on demand.
        </li>
      </ul>

      <p>
        You can use Zero to build all kinds of web apps, from blogs to
        collaborative spreadsheets. But where Zero really shines is
        “local-first” style applications like Linear and Superhuman. With Zero,
        these apps can be built in a fraction of the time it would take to build
        even an old-fashioned server-rendered web app.
      </p>
      <p>
        We will be open sourcing{" "}
        <Link href="https://replicache.dev">Replicache</Link> and{" "}
        <Link href="https://reflect.net">Reflect</Link>. Once Zero is ready, we
        will encourage users to move. We expect the migration to be easy, and
        the benefits once migrated to be dramatic.
      </p>
      <p>
        Zero is the culmination of everything we've done with sync over the past
        five years. We are working toward a source release in fall 2024 and an
        open beta Q1 2025.
      </p>

      <div className={styles.footer}>
        <Link href="https://roci.dev">
          <Image
            src="/images/roci-logo.svg"
            className={styles.rociLogo}
            alt="Rocicorp logo"
            width={86}
            height={116}
          />
        </Link>
      </div>
    </div>
  );
}
