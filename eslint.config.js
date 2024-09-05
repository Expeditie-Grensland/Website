// @ts-check

import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import globals from "globals";

export default tsPlugin.config(
  {
    ignores: ["dev/**/*", "dist/**/*"],
  },
  jsPlugin.configs.recommended,
  ...tsPlugin.configs.recommended,
  ...tsPlugin.configs.stylistic,
  {
    plugins: {
      "@typescript-eslint": tsPlugin.plugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsPlugin.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      "no-constant-condition": ["error", { checkLoops: false }],
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
  {
    files: ["src/server/**/*"],
    rules: {
      "import/extensions": ["error", "ignorePackages"],
    },
  },
  {
    files: ["build/**/*", "src/server/**/*"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/client/**/*"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["eslint.config.js", "build/**/*"],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  }
);
