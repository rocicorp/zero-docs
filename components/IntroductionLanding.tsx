'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {DocsPreview} from './DocsPreview';

export function IntroductionLanding() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Hero intro animation with falling sparks
    const createHeroIntroAnimation = () => {
      const heroTitle = heroTitleRef.current;
      if (!heroTitle) return;

      const heroTitleText = heroTitle.querySelector('.hero-title__text');
      const instantWord = heroTitleText?.querySelector('em');

      if (!instantWord) return;

      // Add slam animation class
      heroTitle.classList.add('hero-slam-in');

      // Create falling sparks from the word "Instant"
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const instantRect = instantWord.getBoundingClientRect();
          const colors = [
            '#fc218a',
            '#ff4da6',
            '#ff6bb8',
            '#ffa8d5',
            '#e91e8c',
            '#ff9900',
            '#c157ff',
            '#4c6bff',
            '#00c2ff',
          ];

          for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-spark-particle';

            const leftPadding = 0;
            const rightPadding = 10;
            const randomX =
              instantRect.left -
              leftPadding +
              Math.random() * (instantRect.width + leftPadding + rightPadding);
            const yPosition = Math.pow(Math.random(), 0.5);
            const randomY = instantRect.top + yPosition * instantRect.height;

            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.color = color;

            particle.style.left = `${randomX}px`;
            particle.style.top = `${randomY}px`;

            const horizontalDrift = (Math.random() - 0.5) * 60;
            const fallDistance = 80 + Math.random() * 120;

            particle.style.setProperty('--drift-x', `${horizontalDrift}px`);
            particle.style.setProperty('--fall-y', `${fallDistance}px`);

            const duration = 0.5 + Math.random() * 0.3;
            const delay = Math.random() * 0.1;
            particle.style.animation = `heroSparkFall ${duration}s ease-in forwards`;
            particle.style.animationDelay = `${delay}s`;

            document.body.appendChild(particle);

            setTimeout(
              () => {
                particle.remove();
              },
              (duration + delay) * 1000,
            );
          }
        });
      });
    };

    createHeroIntroAnimation();

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
      } else {
        videoRef.current.pause();
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
            <a href="/docs/quickstart" className="landing-nav-button">
              Docs
            </a>
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
          <h1 className="hero-title" ref={heroTitleRef}>
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
            >
              <source src="/video/test-video-2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-controls">
              <button
                className="video-control-btn video-play-pause"
                aria-label="Play/Pause"
                onClick={toggleVideoPlayPause}
              >
                <svg
                  className="video-icon video-icon-play"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg
                  className="video-icon video-icon-pause"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
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
        </section>

        <section className="section section-intro">
          <p>
            Sync engines enable instant UI by downloading data to the client
            before it's needed. All read and writes are local and synced with
            the server in the background.
          </p>
          <p>
            <em>But there&apos;s a catch:</em> almost all realistic apps have way too
            much data to download ahead of time. There are usually complex
            permissions too &mdash; not all users can read and write all data.
          </p>
          <p>
            We started the Zero project two years ago to solve these problems
            and bring the performance of sync to the entire web.
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
                  We have not auto-loaded this demo because we really want you
                  to see how fast it loads.
                </p>
                <button className="load-demo-btn">Sync 1TB of Data</button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="subheading">How it Works</h2>

          <div className="step-section">
            <h3>Step 1: Install &amp; start a Postgres database</h3>
            <div className="code-block glass-panel">
              <pre>
                <code>
                  <span className="keyword">import</span>{' '}
                  <span className="punctuation">{'{'}</span>{' '}
                  <span className="variable">createClient</span>{' '}
                  <span className="punctuation">{'}'}</span>{' '}
                  <span className="keyword">from</span>{' '}
                  <span className="string">&apos;@supabase/supabase-js&apos;</span>
                  <span className="punctuation">;</span>
                  {'\n\n'}
                  <span className="keyword">const</span>{' '}
                  <span className="variable">supabase</span>{' '}
                  <span className="operator">=</span>{' '}
                  <span className="function">createClient</span>
                  <span className="punctuation">(</span>
                  {'\n  '}
                  <span className="object">process</span>
                  <span className="punctuation">.</span>
                  <span className="object">env</span>
                  <span className="punctuation">.</span>
                  <span className="property">SUPABASE_URL</span>
                  <span className="punctuation">,</span>
                  {'\n  '}
                  <span className="object">process</span>
                  <span className="punctuation">.</span>
                  <span className="object">env</span>
                  <span className="punctuation">.</span>
                  <span className="property">SUPABASE_KEY</span>
                  {'\n'}
                  <span className="punctuation">);</span>
                  {'\n\n'}
                  <span className="keyword">export</span>{' '}
                  <span className="keyword">default</span>{' '}
                  <span className="variable">supabase</span>
                  <span className="punctuation">;</span>
                </code>
              </pre>
            </div>
            <p>
              Start your local Postgres instance and get the database ready for
              development.
            </p>
          </div>

          <div className="step-section">
            <h3>Step 2: Run zero-cache</h3>
            <div className="code-block glass-panel">
              <pre>
                <code>
                  <span className="keyword">import</span>{' '}
                  <span className="punctuation">{'{'}</span>{' '}
                  <span className="variable">Zero</span>{' '}
                  <span className="punctuation">{'}'}</span>{' '}
                  <span className="keyword">from</span>{' '}
                  <span className="string">&apos;@rocicorp/zero&apos;</span>
                  <span className="punctuation">;</span>
                  {'\n\n'}
                  <span className="keyword">const</span>{' '}
                  <span className="variable">z</span>{' '}
                  <span className="operator">=</span>{' '}
                  <span className="keyword">new</span>{' '}
                  <span className="function">Zero</span>
                  <span className="punctuation">(</span>
                  {'{\n  '}
                  <span className="property">server</span>
                  <span className="punctuation">:</span>{' '}
                  <span className="string">&apos;http://localhost:4848&apos;</span>
                  <span className="punctuation">,</span>
                  {'\n  '}
                  <span className="property">schema</span>
                  <span className="punctuation">:</span>{' '}
                  <span className="punctuation">{'{'}</span>
                  {'\n    '}
                  <span className="property">issues</span>
                  <span className="punctuation">:</span>{' '}
                  <span className="punctuation">{'{'}</span>
                  {'\n      '}
                  <span className="property">tableName</span>
                  <span className="punctuation">:</span>{' '}
                  <span className="string">&apos;issue&apos;</span>
                  <span className="punctuation">,</span>
                  {'\n    '}
                  <span className="punctuation">{'}'}</span>
                  <span className="punctuation">,</span>
                  {'\n  '}
                  <span className="punctuation">{'}'}</span>
                  <span className="punctuation">,</span>
                  {'\n'}
                  <span className="punctuation">{'}'}</span>
                  <span className="punctuation">);</span>
                  {'\n\n'}
                  <span className="keyword">export</span>{' '}
                  <span className="keyword">default</span>{' '}
                  <span className="variable">z</span>
                  <span className="punctuation">;</span>
                </code>
              </pre>
            </div>
            <p>
              In another terminal tab, start the local zero-cache service to
              enable query syncing and reactivity.
            </p>
          </div>

          <div className="step-section">
            <h3>Step 3: Start your application</h3>
            <div className="code-block glass-panel">
              <pre>
                <code>
                  <span className="keyword">import</span>{' '}
                  <span className="punctuation">{'{'}</span>{' '}
                  <span className="variable">useQuery</span>{' '}
                  <span className="punctuation">{'}'}</span>{' '}
                  <span className="keyword">from</span>{' '}
                  <span className="string">&apos;@rocicorp/zero/react&apos;</span>
                  <span className="punctuation">;</span>
                  {'\n'}
                  <span className="keyword">import</span>{' '}
                  <span className="variable">z</span>{' '}
                  <span className="keyword">from</span>{' '}
                  <span className="string">&apos;./zero&apos;</span>
                  <span className="punctuation">;</span>
                  {'\n\n'}
                  <span className="keyword">export</span>{' '}
                  <span className="keyword">function</span>{' '}
                  <span className="function">IssuesList</span>
                  <span className="punctuation">()</span>{' '}
                  <span className="punctuation">{'{'}</span>
                  {'\n  '}
                  <span className="keyword">const</span>{' '}
                  <span className="variable">issues</span>{' '}
                  <span className="operator">=</span>{' '}
                  <span className="function">useQuery</span>
                  <span className="punctuation">(</span>
                  <span className="variable">z</span>
                  <span className="punctuation">.</span>
                  <span className="property">query</span>
                  <span className="punctuation">.</span>
                  <span className="property">issues</span>
                  <span className="punctuation">);</span>
                  {'\n\n  '}
                  <span className="keyword">return</span>{' '}
                  <span className="punctuation">(</span>
                  {'\n    '}
                  <span className="tag">&lt;div&gt;</span>
                  {'\n      '}
                  <span className="punctuation">{'{'}</span>
                  <span className="variable">issues</span>
                  <span className="punctuation">.</span>
                  <span className="function">map</span>
                  <span className="punctuation">(</span>
                  <span className="parameter">issue</span>{' '}
                  <span className="operator">=&gt;</span>{' '}
                  <span className="punctuation">(</span>
                  {'\n        '}
                  <span className="tag">&lt;div</span>{' '}
                  <span className="attribute">key</span>
                  <span className="operator">=</span>
                  <span className="punctuation">{'{'}</span>
                  <span className="parameter">issue</span>
                  <span className="punctuation">.</span>
                  <span className="property">id</span>
                  <span className="punctuation">{'}'}</span>
                  <span className="tag">&gt;</span>
                  <span className="punctuation">{'{'}</span>
                  <span className="parameter">issue</span>
                  <span className="punctuation">.</span>
                  <span className="property">title</span>
                  <span className="punctuation">{'}'}</span>
                  <span className="tag">&lt;/div&gt;</span>
                  {'\n      '}
                  <span className="punctuation">))</span>
                  <span className="punctuation">{'}'}</span>
                  {'\n    '}
                  <span className="tag">&lt;/div&gt;</span>
                  {'\n  '}
                  <span className="punctuation">);</span>
                  {'\n'}
                  <span className="punctuation">{'}'}</span>
                </code>
              </pre>
            </div>
            <p>In a final terminal tab, start your application.</p>
          </div>
        </section>

        <section className="section">
          <h2 className="subheading">Only with Zero</h2>
          <p>
            Zero&apos;s query-driven sync enables a really powerful set of features.
            Some tools offer some of these features, but only Zero offers all of
            them together.
          </p>

          <div className="feature-grid">
            <Link
              className="feature-card feature-card--link"
              href="/docs/permissions"
            >
              <h3>Fine-Grained Permissions</h3>
              <p>
                Define row- and field-level access rules so each user sees
                exactly the data they&apos;re allowed to.
              </p>
            </Link>
            <Link
              className="feature-card feature-card--link"
              href="/docs/reading-data"
            >
              <h3>Partial Sync</h3>
              <p>
                Only data returned by active queries is synced to the client —
                no need to ship entire tables.
              </p>
            </Link>
            <Link className="feature-card feature-card--link" href="/docs/offline">
              <h3>Client-First Reads & Writes</h3>
              <p>
                Queries resolve on the client for instant results. Writes apply
                immediately and sync seamlessly.
              </p>
            </Link>
            <Link
              className="feature-card feature-card--link"
              href="/docs/writing-data"
            >
              <h3>Atomic Transactions</h3>
              <p>
                Group multiple writes into one transaction. All succeed — or all
                roll back together.
              </p>
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
                  We tried building our own sync layer. Should&apos;ve just used Zero
                  from day one. Saved us months of development time.
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
                  seamlessly. Our users don&apos;t even notice when their connection
                  drops.
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

        <section className="section section-get-started">
          <h2 className="subheading">Ready to Get Started?</h2>
          <p>
            Dive into the docs to see how Zero fits into your stack, and hop
            into our Discord to connect with the team and other builders.
          </p>

          {/* Scroll indicator positioned below text */}
          <div className="scroll-indicator-static">
            <div className="scroll-indicator-content">
              <svg
                className="scroll-indicator-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
              <span>Keep scrolling to explore the docs</span>
            </div>
          </div>
        </section>

        {/* Large blank space for scroll transition */}
        <div className="transition-spacer"></div>
      </main>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="demo-modal active">
          <div
            className="demo-modal-backdrop"
            onClick={() => setShowDemoModal(false)}
          ></div>
          <div className="demo-modal-content">
            <div className="demo-modal-pill pop-in">Tada! Loaded in 1.5s.</div>
            <div className="demo-iframe-wrapper">
              <iframe
                src="https://zbugs-qtpvqu9px.preview.rocicorp.dev/p/roci?demo"
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

      <DocsPreview />
    </div>
  );
}
