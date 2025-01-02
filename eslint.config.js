import antfu from "@antfu/eslint-config";

export default antfu({
  stylistic: {
    semi: true,
    quotes: "double",
  },
  rules: {
    "style/arrow-parens": ["error", "as-needed"],
  },
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  vue: {
    overrides: {
      "vue/html-self-closing": ["error", {
        html: {
          void: "any",
        },
      }],
    },
  },
});
