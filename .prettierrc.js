module.exports = {
  ...require('@rocicorp/prettier-config'),
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 65,
        proseWrap: 'preserve',
      },
    },
  ],
};
