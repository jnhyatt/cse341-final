import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js, prettier: prettierPlugin },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node },
        rules: {
            "prettier/prettier": "error",
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
    { files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"] },
    { files: ["**/*.json5"], plugins: { json }, language: "json/json5", extends: ["json/recommended"] },
    prettierConfig,
]);
