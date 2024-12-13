import nyxb from "@nyxb/eslint-config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

export default nyxb(
  {
    // stylistic: true,
    // // Or customize the stylistic rules
    stylistic: {
      indent: 2,
      quotes: "single",
      semi: true,
    },
    ignores: ["node_modules", "dist", "assets"],
  },
  ...compat.config({
    // taken from https://github.com/Sun-ZhenXing/algo-code-mgr/blob/main/eslint.config.js
    extends: [],
    rules: {
      "no-console": "off", // Disable the no-console rule
    },
  })
);
