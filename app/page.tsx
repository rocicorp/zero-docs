import {IntroductionLanding} from '@/components/IntroductionLanding';
import {Metadata} from 'next';

const title = 'Zero';
const description = 'General Purpose Sync for the Web';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: `/api/og?logo=zero`,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: `/api/og?logo=zero`,
  },
};

export default function Home() {
  return <IntroductionLanding />;
}
