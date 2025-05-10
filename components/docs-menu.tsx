import {ROUTES} from '@/lib/routes-config';
import SubLink from './sublink';
import Link from 'next/link';
import GithubLogo from './logos/Github';
import DiscordLogo from './logos/Discord';
import BlueskyLogo from './logos/Bluesky';
import TwitterLogo from './logos/Twitter';
export default function DocsMenu({isSheet = false}) {
  return (
    <div className="flex flex-col gap-12 mt-5 pr-2 pb-6">
      {ROUTES.map((item, index) => {
        const modifiedItems = {
          ...item,
          href: `/docs${item.href}`,
          level: 0,
          isSheet,
        };
        return <SubLink key={item.title + index} {...modifiedItems} />;
      })}

      <div className="footer-container">
        <p className="copyright">
          Made by{' '}
          <Link href="https://rocicorp.dev" className="footer-text-link">
            Rocicorp
          </Link>
        </p>
        <div className="social-links">
          <Link href="https://github.com/rocicorp/mono">
            <GithubLogo />
          </Link>
          <Link href="https://discord.rocicorp.dev">
            <DiscordLogo />
          </Link>
          <Link href="https://bsky.app/profile/zero.rocicorp.dev">
            <BlueskyLogo />
          </Link>
          <Link href="https://x.com/rocicorp_zero">
            <TwitterLogo />
          </Link>
        </div>
      </div>
    </div>
  );
}
