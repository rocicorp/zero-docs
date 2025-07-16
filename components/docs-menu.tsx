import {ROUTES} from '@/lib/routes-config';
import Link from 'next/link';
import BlueskyLogo from './logos/Bluesky';
import DiscordLogo from './logos/Discord';
import GithubLogo from './logos/Github';
import TwitterLogo from './logos/Twitter';
import SubLink from './sublink';
import {ModeToggle} from './theme-toggle';

export default function DocsMenu({isSheet = false}) {
  return (
    <div className="flex flex-col mt-5 pr-2 gap-8 pb-6">
      {ROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs${item.href ?? ''}`,
          level: 0,
          isSheet,
          noLink: item.href === null,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}

      <div className="footer-container mt-6">
        <p className="copyright">
          Made by{' '}
          <Link href="https://rocicorp.dev" className="footer-text-link">
            Rocicorp
          </Link>
        </p>
        <div className="social-links">
          <Link href="https://github.com/rocicorp/mono#zero">
            <GithubLogo />
          </Link>
          <Link href="https://discord.rocicorp.dev">
            <DiscordLogo />
          </Link>
          <Link href="https://bsky.app/profile/zero.rocicorp.dev">
            <BlueskyLogo />
          </Link>
          <Link href="https://x.com/zero__ms">
            <TwitterLogo />
          </Link>
        </div>
        <ModeToggle />
      </div>
    </div>
  );
}
