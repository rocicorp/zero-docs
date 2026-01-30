import {IntroductionLanding} from '@/components/IntroductionLanding';
import {Metadata} from 'next';

const title = 'Zero';
const description = 'Instant Queries by Default';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: '/opengraph-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: '/opengraph-image.png',
  },
};

export default function Home() {
  return <IntroductionLanding />;
}
