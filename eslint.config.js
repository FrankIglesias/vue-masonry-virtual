import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'

export default tseslint.config(
  // Ignore generated / dependency output
  { ignores: ['dist/**', 'node_modules/**', 'docs/.vitepress/dist/**', 'docs/.vitepress/cache/**'] },

  // Base JS rules
  pluginJs.configs.recommended,

  // TypeScript — strict but pragmatic
  ...tseslint.configs.recommended,

  // Vue 3 recommended rules
  ...pluginVue.configs['flat/recommended'],

  // Tell ESLint to parse <script setup lang="ts"> with the TS parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },

  // Browser globals for all source files
  {
    files: ['src/**', 'demo/**', 'tests/**'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Project-wide rule overrides
  {
    rules: {
      // Allow unused vars when prefixed with _ (common convention)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Generic component props (T) in <script setup generic="T"> need explicit type references
      '@typescript-eslint/no-explicit-any': 'warn',

      // Vue: allow single-word component names in demo/
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],

      // Vue: allow v-html only in demo (not library)
      'vue/no-v-html': 'warn',

      // Enforce consistent component definition style
      'vue/component-api-style': ['error', ['script-setup', 'composition']],

      // Prefer const
      'prefer-const': 'error',

      // No console.log in library code; allowed in demo/tests
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Prettier must be last — disables all formatting rules that Prettier handles
  configPrettier,
)
