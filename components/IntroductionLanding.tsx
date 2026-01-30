'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import CopyButtonListener from './ui/copy-button-listener';
import RocicorpLogo from './logos/Rocicorp';
import CodeGroup from './CodeGroup';
import {Popover, PopoverTrigger, PopoverContent} from './ui/popover';
import {
  enterFullscreen,
  exitFullscreen,
  isCurrentlyFullscreen,
} from '@/lib/fullscreen';
import {parseMdx} from '@/lib/mdx';
import {useIsMobile} from './hooks/use-mobile';

export function IntroductionLanding({
  codeExamples,
}: {
  codeExamples: {
    app: Awaited<ReturnType<typeof parseMdx>>;
    appMobileFriendly: Awaited<ReturnType<typeof parseMdx>>;
    queries: Awaited<ReturnType<typeof parseMdx>>;
    queriesMobileFriendly: Awaited<ReturnType<typeof parseMdx>>;
    mutators: Awaited<ReturnType<typeof parseMdx>>;
    mutatorsMobileFriendly: Awaited<ReturnType<typeof parseMdx>>;
  };
}) {
  const isMobile = useIsMobile();
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

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);

    return () => {
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
    };
  }, []);

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current;

    if (!isCurrentlyFullscreen(videoContainer)) {
      enterFullscreen(videoContainer);
    } else {
      exitFullscreen(videoContainer);
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
              poster="/video/zbugs-poster-dkzx.jpg"
              onClick={toggleVideoPlayPause}
              style={{cursor: 'pointer'}}
            >
              <source src="/video/zbugs-demo-dkzx.mp4" type="video/mp4" />
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
            <a href="https://gigabugs.rocicorp.dev/">Gigabugs</a> – Our 1.2
            million row bug tracker demo.
          </p>
        </section>

        <section className="section section-intro">
          <p>
            Sync engines enable instant UI by downloading data to the client
            ahead of time. Reads and writes happen locally, and changes are
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
              onClick={() => {
                if (window.innerWidth <= 768) {
                  window.open(
                    'https://bugs.rocicorp.dev/p/roci?demo',
                    '_blank',
                  );
                } else {
                  setShowDemoModal(true);
                }
              }}
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

        <section className="section section-how-it-works" id="how-it-works">
          <h2 className="subheading">
            <a href="#how-it-works" className="heading-link">
              How it Works
            </a>
          </h2>

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
              your Postgres DB in SQLite, on fast attached NVMe storage.
            </p>
            <p>
              Client-side, you get an API that <em>looks</em> like an embedded
              database, but to which you can issue arbitrary &quot;hybrid
              queries&quot; that span the entire database, including the server:
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
              <div className="prose max-w-full w-full">
                {isMobile
                  ? codeExamples.appMobileFriendly.content
                  : codeExamples.app.content}
              </div>
              <div className="prose max-w-full w-full">
                {isMobile
                  ? codeExamples.queriesMobileFriendly.content
                  : codeExamples.queries.content}
              </div>
              <div className="prose max-w-full w-full">
                {isMobile
                  ? codeExamples.mutatorsMobileFriendly.content
                  : codeExamples.mutators.content}
              </div>
            </CodeGroup>
          </div>

          <div className="how-it-works-description">
            <p>
              Zero uses a custom-built{' '}
              <Link href="/docs/zql" style={{textDecoration: 'underline'}}>
                streaming query engine
              </Link>{' '}
              to efficiently sync query results to a persistent cache on the
              client. This cache is used automatically for future queries.
            </p>
            <p>
              With thoughtful preloading, this architecture enables UI where
              almost all interactions feel instant.
            </p>
          </div>
        </section>

        <section className="section" id="features">
          <h2 className="subheading">
            <a href="#features" className="heading-link">
              Features
            </a>
          </h2>

          <div className="feature-grid">
            <div className="feature-card feature-card--icon-left">
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
            </div>
            <div className="feature-card feature-card--icon-left">
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
                  instantly. Edge-cases like reverts are handled automatically.
                </p>
              </div>
            </div>
            <div className="feature-card feature-card--icon-left">
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
            </div>
            <div className="feature-card feature-card--icon-left">
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
            </div>
            <div className="feature-card feature-card--icon-left">
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
            </div>
            <div className="feature-card feature-card--icon-left">
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
            </div>
          </div>
        </section>

        <section className="section section-testimonials" id="testimonials">
          <h2 className="subheading">
            <a href="#testimonials" className="heading-link">
              Our Users Say
            </a>
          </h2>
          <p>Check out what our users have to say about Zero.</p>

          <div className="testimonials-grid">
            <a
              href="https://x.com/stolinski/status/1870127005510861202"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Zero is a game changer. You will be shocked at how fast it is.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1404817306031562756/5cHmpCuL_400x400.jpg"
                  alt="Scott Tolinski"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Scott Tolinski</div>
                  <div className="testimonial-title">
                    Co-host of http://Syntax.fm
                  </div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/thdxr/status/1869449253904679133"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Have been building with Zero for months. It&apos;s making me
                  hate all my older codebases.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1602333093485891584/mmVqjFNI_400x400.jpg"
                  alt="Dax Raad"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Dax Raad</div>
                  <div className="testimonial-title">OpenCode, SST.dev</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/fleckensteyn/status/1998440074640314730"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  We rebuilt our sync engine from the ground up to make
                  Productlane the fastest customer support tool out there. Huge
                  shoutout to Zero for making this possible!
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1865821729005674496/VC6IpG6f_400x400.jpg"
                  alt="Raphael Fleckenstein"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Raphael Fleckenstein</div>
                  <div className="testimonial-title">CEO, Productlane.com</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/housecor/status/1945886895470157863"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  One of my favorite features is custom mutators. I can run
                  validation logic instantly on the client for fast UX, and
                  optionally do additional validation on the server for security
                  or performance.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1963593369306750976/7gPWqEa8_400x400.jpg"
                  alt="Cory House"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Cory House</div>
                  <div className="testimonial-title">
                    Founder, ReactJS Consulting
                  </div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/kurt/status/2002441903812509939"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Rocicorp is making something that used to require an insane
                  amount of engineering in-house. Hard to go back once
                  you&apos;ve used it.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1241922871720652803/bOf1XH2y_400x400.jpg"
                  alt="Kurt Schrader"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Kurt Schrader</div>
                  <div className="testimonial-title">CEO, Shortcut</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/fforres/status/1968017796786425928"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  If there&apos;s anything that has changed how we built
                  software, it&apos;s this.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/721330013547663361/LWxIUO2u_400x400.jpg"
                  alt="Felipe Torres"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Felipe Torres</div>
                  <div className="testimonial-title">Founder</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/GreveJoe/status/1984810258561450162"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Ranger now runs faster than <b>any</b> of our competitors
                  thanks to Zero.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1635321690757668864/PsA8fpgz_400x400.jpg"
                  alt="Joe Greve"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Joe Greve</div>
                  <div className="testimonial-title">CEO, Ranger Budget</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/abraguilera/status/2008808256702194030"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Zero is making Plot feel instantaneous. Like blink and you
                  miss it.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/2012194448239681536/Qr7Z55wS_400x400.jpg"
                  alt="Abraham Aguilera"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Abraham Aguilera</div>
                  <div className="testimonial-title">Founder, Plot</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/cschmatzler/status/2004310059548135936"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Deployed it halfway across the world and literally can&apos;t
                  tell.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1971935406355550208/TgteTLXb_400x400.jpg"
                  alt="Christoph Schmatzler"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Christoph Schmatzler</div>
                  <div className="testimonial-title">señor developer</div>
                </div>
              </div>
            </a>

            <a
              href="https://x.com/colmtuite/status/1941718639968649349"
              className="testimonial-card"
            >
              <div className="testimonial-quote">
                <p>
                  Built a notes app yesterday and Zero blew my mind. Excited to
                  see SaaS verticals finally get some good web apps.
                </p>
              </div>
              <div className="testimonial-author">
                <img
                  src="https://pbs.twimg.com/profile_images/1907688428398850048/zAuYRr83_400x400.jpg"
                  alt="Colm Tuite"
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-name">Colm Tuite</div>
                  <div className="testimonial-title">Founder, Base UI</div>
                </div>
              </div>
            </a>
          </div>
        </section>

        <section className="section section-cloud-zero" id="pricing">
          <div className="cloud-zero-header">
            <h2 className="subheading">
              <a href="#pricing" className="heading-link">
                Pricing
              </a>
            </h2>
          </div>

          <div className="how-it-works-description">
            <p>Fully-managed zero-cache, on either your servers or ours.</p>
          </div>

          <div className="cloud-zero-preview">
            <img
              src="/images/cloud-zero-dashboard.png"
              alt="Cloud Zero Dashboard"
              className="cloud-zero-image"
              width={2812}
              height={1456}
            />
          </div>

          <div className="cloud-zero-pricing-stack">
            <div className="cloud-zero-group-card cloud-zero-group-card--saas">
              <div className="cloud-zero-group-header">
                <span className="cloud-zero-group-label">Traditional SaaS</span>
                <p className="cloud-zero-group-subtitle">
                  Runs in Rocicorp&apos;s AWS account
                </p>
              </div>
              <div className="cloud-zero-group-tiers">
                <div className="cloud-zero-tier">
                  <h4 className="cloud-zero-tier-name">Hobby</h4>
                  <ul className="cloud-zero-list">
                    <li>10 GB storage</li>
                    <li>
                      3 shared vCPU
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="cloud-zero-info-btn"
                            aria-label="More info about shared vCPU"
                          >
                            ?
                          </button>
                        </PopoverTrigger>
                        <PopoverContent side="top" sideOffset={4}>
                          Shared with up to four other Hobby accounts.
                        </PopoverContent>
                      </Popover>
                    </li>
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
                  Runs in your AWS account
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
                <a href="mailto:hello@rocicorp.dev" className="load-demo-btn">
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

        <section className="section section-get-started" id="get-started">
          <h2 className="subheading">
            <a href="#get-started" className="heading-link">
              Get Started
            </a>
          </h2>

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
          rel="noopener noreferrer"
          className="landing-footer-link"
        >
          <RocicorpLogo className="landing-footer-logo" />
          <span className="landing-footer-text">
            Made by <span className="landing-footer-underline">Rocicorp</span>
          </span>
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
                src="https://bugs.rocicorp.dev/p/roci?demo"
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
