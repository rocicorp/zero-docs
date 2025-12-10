module.exports = {
  ...require('@rocicorp/prettier-config'),
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 60,
        proseWrap: 'preserve',
        semi: false,
        trailingComma: 'none',
        arrowParens: 'avoid',
      },
    },
  ],
};
