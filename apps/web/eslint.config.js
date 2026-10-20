import js from "@eslint/js";

export default [
  {
    ignores: ["dist", "coverage"],
  },
  js.configs.recommended,
];