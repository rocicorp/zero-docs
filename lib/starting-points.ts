export type StartingPointDescriptionSegment =
  | string
  | {
      text: string;
      href: string;
    };

export type StartingPoint = {
  title: string;
  href: string;
  description: StartingPointDescriptionSegment[];
  duration: string;
};

export const startingPoints: StartingPoint[] = [
  {
    title: 'Install',
    href: '/docs/install',
    description: [
      'Add Zero to your existing application following our step-by-step guide.',
    ],
    duration: '30 minutes',
  },
  {
    title: 'Tutorial',
    href: '/docs/tutorial',
    description: [
      'Learn how Zero works by following our guided tutorial building a music app.',
    ],
    duration: '15 minutes',
  },
  {
    title: 'Quickstarts',
    href: '/docs/quickstart',
    description: ['Start a new app with one of our bare-bones templates.'],
    duration: '1 minute',
  },
  {
    title: 'Samples',
    href: '/docs/samples',
    description: [
      'Explore our more fully-featured samples to see what Zero can do.',
    ],
    duration: 'Stay as long as you like',
  },
];
