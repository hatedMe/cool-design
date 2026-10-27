import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "dist/**", "es/**", "lib/**", "coverage/**", ".superpowers/**"]
  },
  eslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
        AMap: "readonly",
        mpvue: "readonly",
        uni: "readonly",
        wx: "readonly"
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-console": "off",
      "no-debugger": "off",
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      indent: ["error", 2],
      "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
      "no-irregular-whitespace": ["error", { skipComments: true }],
      "vue/html-indent": [
        "error",
        2,
        {
          attribute: 1,
          baseIndent: 1,
          closeBracket: 0,
          alignAttributesVertically: true,
          ignores: []
        }
      ],
      "vue/no-parsing-error": [
        "error",
        {
          "x-invalid-end-tag": false
        }
      ],
      // Demo files and web components intentionally use single-word names.
      "vue/multi-word-component-names": "off",
      // Component names follow the library's kebab-case registration convention.
      "vue/component-definition-name-casing": "off",
      // Optional Vue props intentionally rely on Vue's undefined default.
      "vue/require-default-prop": "off",
      // Tests define several small fixture components in one file.
      "vue/one-component-per-file": "off"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser
    }
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  prettier
);
