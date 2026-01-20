'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import CopyButtonListener from './ui/copy-button-listener';
import RocicorpLogo from './logos/Rocicorp';
import CodeGroup from './CodeGroup';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

// Register TypeScript/TSX for syntax highlighting
hljs.registerLanguage('typescript', typescript);

const codeExamples = {
  app: `import {queries} from 'queries.ts'
import {mutators} from 'mutators.ts'

function Playlist({id}: {id: string}) {
  // This usually resolves *instantly*, and updates reactively
  // as server data changes. Just wire it directly to your UI –
  // no HTTP APIs, no state management no realtime goop.
  const [playlist] = useQuery(
    queries.playlist.byID({id})
  );

  const onStar = (id: string, starred: boolean) => {
    mutators.playlist.star({id, starred});
  };

  // render playlist...
}`,
  queries: `import {defineQueries, defineQuery} from '@rocicorp/zero'
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
})`,
  mutators: `import {defineMutators, defineMutator} from '@rocicorp/zero'
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
  }
})`,
};

export function IntroductionLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Handle escape key for demo modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDemoModal(false);
      }
    };

    if (showDemoModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showDemoModal]);

  const toggleVideoPlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const scrollToTop = () => {
    const start = window.scrollY;
    const duration = 300;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);

      window.scrollTo(0, start * (1 - easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <div className="intro-landing-page">
      <CopyButtonListener />
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo" onClick={scrollToTop}>
            <img src="/images/logo.svg" alt="Zero Logo" />
            <img
              src="/images/wordmark.svg"
              alt="Zero Wordmark"
              className="landing-wordmark"
            />
          </div>
          <nav className="landing-nav">
            <a
              href="https://github.com/rocicorp/mono#zero"
              className="landing-nav-link"
            >
              GitHub
            </a>
            <Link href="/docs/quickstart" className="landing-nav-button">
              Docs
            </Link>
          </nav>
        </div>
      </header>
      <main className="intro-main" ref={mainRef}>
        <section className="section section-hero">
          <span className="hero-byline">
            <span className="hero-byline__icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
            </span>
            Build absurdly <em>fast</em> web applications with Zero
          </span>
          <h1 className="hero-title">
            <span className="hero-title__text">
              <em>Instant</em> Queries by Default
            </span>
          </h1>
        </section>

        <section className="section section-video">
          <div className="video-container">
            <video
              ref={videoRef}
              className="video-player"
              autoPlay
              loop
              muted
              playsInline
              onClick={toggleVideoPlayPause}
              style={{cursor: 'pointer'}}
            >
              <source src="/video/zbugs-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-controls">
              <button
                className="video-control-btn video-play-pause"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={toggleVideoPlayPause}
              >
                {isPlaying ? (
                  <svg
                    className="video-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="video-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                className="video-control-btn video-fullscreen"
                aria-label="Fullscreen"
                onClick={toggleFullscreen}
              >
                <svg
                  className="video-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="video-caption">
            <a href="https://gigabugs.rocicorp.dev/" target="_blank">
              Gigabugs
            </a>{' '}
            – Our 1.2 million row bug tracker demo.
          </p>
        </section>

        <section className="section section-intro">
          <p>
            Sync engines enable instant UI by downloading data to the client
            ahead of time. All read and writes happen locally, and changes are
            synced in the background.
          </p>
          <p>
            <em>But there&apos;s a catch</em>. Apps usually have far too much
            data to download up-front. They also often have permissions – not
            all users can read and write all data.
          </p>
          <p>
            We created Zero to solve these problems and bring the performance of
            sync to the entire web.
          </p>
        </section>

        <section className="section section-try-it">
          <div className="section-try-it-content">
            <div
              className="demo-container"
              onClick={() => setShowDemoModal(true)}
            >
              <div className="demo-prompt">
                <h3 className="demo-prompt-title">Try it out right now.</h3>
                <p className="demo-intro-text">
                  Our Gigabugs demo has 1.2 million rows, and loads in less than
                  2 seconds.
                </p>
                <button className="load-demo-btn">Sync 1GB of Data</button>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-how-it-works">
          <h2 className="subheading">How it Works</h2>

          <div className="how-it-works-illustration">
            <img
              src="/images/how-it-works.svg"
              alt="Zero Architecture Diagram"
              className="how-it-works-svg"
            />
          </div>

          <div className="how-it-works-description">
            <p>
              Zero has two parts: <code>zero-client</code> and{' '}
              <code>zero-cache</code>.
            </p>
            <p>
              Zero-cache runs in the cloud and maintains a read-only replica of
              your Postgres DB in SQLite on fast attached NVMe storage.
            </p>
            <p>
              On the client, you get an API that <em>looks</em> like an embedded
              database, but to which you can issue arbitrary "hybrid queries"
              that span the entire database, including the server:
            </p>
          </div>

          <div className="code-block-tabbed">
            <CodeGroup
              labels={[
                {text: 'app.tsx'},
                {text: 'queries.ts'},
                {text: 'mutators.ts'},
              ]}
            >
              <pre className="has-copy-button">
                <button className="font-regular copy-button" type="button">
                  Copy
                </button>
                <code
                  className="language-typescript"
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(codeExamples.app, {
                      language: 'typescript',
                    }).value,
                  }}
                />
              </pre>
              <pre className="has-copy-button">
                <button className="font-regular copy-button" type="button">
                  Copy
                </button>
                <code
                  className="language-typescript"
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(codeExamples.queries, {
                      language: 'typescript',
                    }).value,
                  }}
                />
              </pre>
              <pre className="has-copy-button">
                <button className="font-regular copy-button" type="button">
                  Copy
                </button>
                <code
                  className="language-typescript"
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(codeExamples.mutators, {
                      language: 'typescript',
                    }).value,
                  }}
                />
              </pre>
            </CodeGroup>
          </div>

          <div className="how-it-works-description">
            <p>
              Zero uses a custom-built{' '}
              <Link href="/docs/zql" style={{textDecoration: 'underline'}}>
                streaming query engine
              </Link>{' '}
              to efficiently sync query results to a persistent cache on the
              client. This cache is used automatically for client-side reads and
              writes when possible.
            </p>
            <p>
              With thoughtful query preloading, this architecture means that
              almost all interactions feel instant.
            </p>
          </div>
        </section>

        <section className="section">
          <h2 className="subheading">Features</h2>

          <div className="feature-grid">
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="/docs/permissions"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v8" />
                  <path d="m16 6-4 4-4-4" />
                  <rect width="20" height="8" x="2" y="14" rx="2" />
                  <path d="M6 18h.01" />
                  <path d="M10 18h.01" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Instant Reads</h3>
                <p>
                  Queries are always client-first, returning matching local data
                  immediately – literally in the next frame.
                </p>
              </div>
            </Link>
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="#"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m16 6-4-4-4 4" />
                  <path d="M12 2v8" />
                  <rect width="20" height="8" x="2" y="14" rx="2" />
                  <path d="M6 18h.01" />
                  <path d="M10 18h.01" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Instant Writes</h3>
                <p>
                  Writes are always client-first, updating all open queries
                  instantly. Edge cases like reverts are handled automatically.
                </p>
              </div>
            </Link>
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="/docs/offline"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 16 4 4 4-4" />
                  <path d="M7 20V4" />
                  <path d="m21 8-4-4-4 4" />
                  <path d="M17 4v16" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Automatic Reactivity</h3>
                <p>
                  All queries are reactive. When data changes on the server –
                  even from non-Zero clients – affected queries are
                  automatically updated.
                </p>
              </div>
            </Link>
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="/docs/writing-data"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Fast Startup</h3>
                <p>
                  Query-driven sync provides precise control over when data is
                  synced, enabling you to balance startup and interaction
                  performance.
                </p>
              </div>
            </Link>
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="/docs/writing-data"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                  <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                  <line x1="6" x2="6.01" y1="6" y2="6" />
                  <line x1="6" x2="6.01" y1="18" y2="18" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Server Authority</h3>
                <p>
                  All reads and writes flow through your code on your server,
                  giving you complete control over permissions and business
                  logic.
                </p>
              </div>
            </Link>
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="/docs/writing-data"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" />
                  <rect x="14" y="2" width="8" height="8" rx="1" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Easy Integration</h3>
                <p>
                  Zero works with normal Postgres databases, using normal
                  Postgres schemas, with normal APIs and libraries.
                </p>
              </div>
            </Link>
          </div>
        </section>

        <section className="section section-testimonials">
          <h2 className="subheading">Our Users Say</h2>
          <p>Check out what our users have to say about Zero.</p>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                <p>
                  Zero completely changed how we think about real-time. The
                  query-driven sync is genius — our app feels instant now.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  alt="Matt Wonlaw"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Matt Wonlaw</div>
                  <div className="testimonial-title">
                    Engineering Lead, Streamline
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                <p>
                  We tried building our own sync layer. Should&apos;ve just used
                  Zero from day one. Saved us months of development time.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://i.pravatar.cc/150?img=33"
                  alt="Marcus Rodriguez"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Marcus Rodriguez</div>
                  <div className="testimonial-title">CTO, Catalyst Labs</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                <p>
                  The permission system is incredibly powerful. We can finally
                  give users real-time collaboration without worrying about data
                  leaks.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://i.pravatar.cc/150?img=47"
                  alt="Priya Patel"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Priya Patel</div>
                  <div className="testimonial-title">
                    Senior Developer, Nexus
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                <p>
                  Local-first with Zero means our app works offline and syncs
                  seamlessly. Our users don&apos;t even notice when their
                  connection drops.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://i.pravatar.cc/150?img=68"
                  alt="Alex Kumar"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Alex Kumar</div>
                  <div className="testimonial-title">Founder, TaskFlow</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                <p>
                  The developer experience is top-notch. Write queries, get
                  reactive updates. It&apos;s that simple.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://i.pravatar.cc/150?img=27"
                  alt="Jamie Taylor"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Jamie Taylor</div>
                  <div className="testimonial-title">
                    Full-Stack Developer, Velocity
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                <p>
                  Zero handles the hard parts of sync so we can focus on
                  building features. The performance gains are unreal.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://i.pravatar.cc/150?img=59"
                  alt="Taylor Morgan"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Taylor Morgan</div>
                  <div className="testimonial-title">
                    Product Engineer, Orbit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-cloud-zero">
          <div className="cloud-zero-header">
            <h2 className="subheading">Pricing</h2>
          </div>

          <div className="how-it-works-description">
            <p>Fully-managed zero-cache, on either your servers or ours.</p>
          </div>

          <div className="cloud-zero-preview">
            <img
              src="/images/cloud-zero-dashboard.png"
              alt="Cloud Zero Dashboard"
              className="cloud-zero-image"
            />
          </div>

          <div className="cloud-zero-pricing-stack">
            <div className="cloud-zero-group-card cloud-zero-group-card--saas">
              <div className="cloud-zero-group-header">
                <span className="cloud-zero-group-label">Traditional SaaS</span>
                <p className="cloud-zero-group-subtitle">
                  Runs in Rocicorp&apos;s AWS account.
                </p>
              </div>
              <div className="cloud-zero-group-tiers">
                <div className="cloud-zero-tier">
                  <h4 className="cloud-zero-tier-name">Hobby</h4>
                  <ul className="cloud-zero-list">
                    <li>10 GB storage</li>
                    <li>3 shared vCPU</li>
                    <li>Support via public Discord</li>
                    <li>Additional storage: $0.20/GB</li>
                    <li>Dedicated vCPU: $50 each</li>
                  </ul>
                  <div className="cloud-zero-tier-price">
                    <div className="cloud-zero-tier-price-row">
                      <span className="cloud-zero-price">$30</span>
                      <span className="cloud-zero-price-unit">/mo</span>
                    </div>
                  </div>
                </div>
                <div className="cloud-zero-tier">
                  <h4 className="cloud-zero-tier-name">Professional</h4>
                  <ul className="cloud-zero-list">
                    <li>100 GB storage</li>
                    <li>6 dedicated vCPU</li>
                    <li>Shared Slack channel</li>
                    <li>Additional storage: $0.20/GB</li>
                    <li>Additional vCPU: $50</li>
                  </ul>
                  <div className="cloud-zero-tier-price">
                    <div className="cloud-zero-tier-price-row">
                      <span className="cloud-zero-price">$300</span>
                      <span className="cloud-zero-price-unit">/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-zero-group-card cloud-zero-group-card--byoc">
              <div className="cloud-zero-group-header">
                <span className="cloud-zero-group-label">BYOC</span>
                <p className="cloud-zero-group-subtitle">
                  Runs in your AWS account.
                </p>
              </div>
              <div className="cloud-zero-tier">
                <h4 className="cloud-zero-tier-name">Bring Your Own Cloud</h4>
                <ul className="cloud-zero-list">
                  <li>Data stays in your AWS account</li>
                  <li>Rocicorp has limited privileges</li>
                  <li>AWS infra billed to your account</li>
                  <li>Shared Slack channel</li>
                  <li>Includes 10 vCPU</li>
                  <li>Additional vCPU: $20</li>
                </ul>
                <div className="cloud-zero-tier-price">
                  <div className="cloud-zero-tier-price-row">
                    <span className="cloud-zero-price">$1000</span>
                    <span className="cloud-zero-price-unit">/mo</span>
                    <span className="cloud-zero-price-secondary">+ AWS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cloud-zero-cta-container">
            <div className="cloud-zero-cta-prompt">
              <h3 className="demo-prompt-title">Get in Touch</h3>
              <p className="demo-intro-text">
                Hosting is in private beta. Message us and we&apos;ll get you
                onboarded.
              </p>
              <div className="cloud-zero-cta-buttons">
                <a href="mailto:hello@rocicorp.com" className="load-demo-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>Email us</span>
                </a>
                <a
                  href="https://discord.rocicorp.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="load-demo-btn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span>Discord</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-get-started">
          <h2 className="subheading">Get Started</h2>

          <div className="feature-grid">
            <Link
              className="feature-card feature-card--icon-left feature-card--link"
              href="/docs/quickstart"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>View the Docs</h3>
                <p>
                  Get started with Zero and learn how it fits into your stack.
                </p>
              </div>
            </Link>
            <a
              className="feature-card feature-card--icon-left feature-card--link"
              href="https://discord.rocicorp.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="feature-card-icon-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <div className="feature-card-content">
                <h3>Join Discord</h3>
                <p>
                  Connect with the team and other builders in our community.
                </p>
              </div>
            </a>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Link
          href="https://rocicorp.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="landing-footer-link"
        >
          <RocicorpLogo className="landing-footer-logo" />
          <span className="landing-footer-text">Made by Rocicorp</span>
        </Link>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="demo-modal active">
          <div
            className="demo-modal-backdrop"
            onClick={() => setShowDemoModal(false)}
          ></div>
          <div className="demo-modal-content">
            <div className="demo-iframe-wrapper">
              <iframe
                src="https://zbugs-5u190hv7h.preview.rocicorp.dev/p/roci?demo"
                className="demo-iframe"
                title="Zero Demo"
              ></iframe>
            </div>
            <button
              className="feature-card feature-card--link demo-exit-card"
              onClick={() => setShowDemoModal(false)}
            >
              <span className="demo-exit-card__icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9" />
                  <path d="M13 12H4" />
                  <path d="M6.5 8.5 3 12l3.5 3.5" />
                </svg>
              </span>
              <div className="demo-exit-card__content">
                <h3>Exit Demo</h3>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
