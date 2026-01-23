import antfu from "@antfu/eslint-config";
import tailwindcss from "eslint-plugin-better-tailwindcss";

const twConfig = {
  extends: [
    tailwindcss.configs["recommended-warn"],
  ],
  rules: {
    "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    "better-tailwindcss/no-unregistered-classes": ["warn"],
  },
  settings: {
    "better-tailwindcss": {
      entryPoint: "app/style.css",
    },
  },
};

export default antfu({
  stylistic: {
    semi: true,
    quotes: "double",
  },
  rules: {
    "style/arrow-parens": ["error", "as-needed"],
    "ts/strict-boolean-expressions": "off",
    "pnpm/json-enforce-catalog": "off",
    "pnpm/json-prefer-workspace-settings": "off",
    "pnpm/json-valid-catalog": "off",
  },
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  markdown: {
    overrides: {
      "import/consistent-type-specifier-style": "off",
    },
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
}, twConfig);
