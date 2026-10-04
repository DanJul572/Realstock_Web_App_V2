// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  // Reports Prettier differences as lint errors and turns off the ESLint
  // style rules that would conflict with Prettier.
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
  },
]);
