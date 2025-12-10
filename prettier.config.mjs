import prettierConfig from "@rocicorp/prettier-config" with { type: "json" }

export default {
  ...prettierConfig,
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        printWidth: 60,
        proseWrap: "preserve",
        semi: false,
        trailingComma: "none",
        arrowParens: "avoid",
      },
    },
  ],
}
