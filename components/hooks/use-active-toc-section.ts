'use client';

import {useEffect, useState} from 'react';

const NAV_OFFSET = 16;
const PAGE_BOTTOM_THRESHOLD = 24;

type TocEntry = {
  href: string;
};

type HeadingTarget = {
  href: string;
  element: HTMLElement;
};

const getHeadingId = (href: string) => href.replace(/^#/, '');

const getNavActivationOffset = () => {
  const nav = document.querySelector('.inner-docs-nav');
  const navHeight =
    nav instanceof HTMLElement ? nav.getBoundingClientRect().height : 72;
  return navHeight + NAV_OFFSET;
};

export default function useActiveTocSection(tocs: TocEntry[]) {
  const [activeHref, setActiveHref] = useState<string | null>(
    tocs[0]?.href ?? null,
  );

  useEffect(() => {
    setActiveHref(tocs[0]?.href ?? null);

    if (tocs.length === 0) {
      return;
    }

    const headings = tocs
      .map(({href}) => {
        const id = getHeadingId(href);
        const element = id ? document.getElementById(id) : null;
        return element instanceof HTMLElement ? {href, element} : null;
      })
      .filter((heading): heading is HeadingTarget => heading !== null);

    if (headings.length === 0) {
      setActiveHref(null);
      return;
    }

    let frameId = 0;

    const getActiveHref = () => {
      if (
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - PAGE_BOTTOM_THRESHOLD
      ) {
        return headings[headings.length - 1].href;
      }

      const activationOffset = getNavActivationOffset();
      let currentHref = headings[0].href;

      for (const heading of headings) {
        if (heading.element.getBoundingClientRect().top <= activationOffset) {
          currentHref = heading.href;
          continue;
        }

        break;
      }

      return currentHref;
    };

    const updateActiveHref = () => {
      const nextHref = getActiveHref();
      setActiveHref(prevHref => (prevHref === nextHref ? prevHref : nextHref));
    };

    const scheduleUpdate = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateActiveHref();
      });
    };

    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash && headings.some(heading => heading.href === hash)) {
        setActiveHref(prevHref => (prevHref === hash ? prevHref : hash));
      }

      scheduleUpdate();
    };

    scheduleUpdate();

    window.addEventListener('scroll', scheduleUpdate, {passive: true});
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('hashchange', syncFromHash);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, [tocs]);

  return activeHref;
}
