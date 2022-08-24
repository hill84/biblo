// const airbnbStyleRules = require('eslint-config-airbnb-base/rules/style').rules;

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of TSX
    },
    ecmaVersion: 11, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': ['off', { allowExpressions: true }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'block-scoped-var': 'error',
    'default-case': 'error',
    'linebreak-style': ['error', 'windows'],
    'no-alert': 'warn',
    'no-const-assign': 'error',
    'no-extra-label': 'warn',
    'no-loop-func': 'warn',
    'no-mixed-spaces-and-tabs': 'warn',
    'no-new-wrappers': 'warn',
    'no-return-assign': ['off'],
    'no-self-assign': 'error',
    'no-self-compare': 'error',
    'no-undef-init': 'warn',
    'no-unreachable': 'error',
    'no-useless-catch': 'error',
    'no-useless-escape': 'error',
    'prefer-promise-reject-errors': ['off'],
    'react/jsx-filename-extension': ['off'],
    'react/prop-types': 'off',
    'use-isnan': 'error',
    // 'no-unused-vars': 'error',
    // 'react-hooks/exhaustive-deps': 'warn',
    // 'react-hooks/rules-of-hooks': 'error',
    eqeqeq: 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single'],
    semi: ['error', 'always', { omitLastInOneLineBlock: true }],
  },
  settings: {
    react: {
      createClass: 'createReactClass',
      pragma: 'React',
      version: 'detect',
      flowVersion: '0.53',
    },
    propWrapperFunctions: [
      'forbidExtraProps',
      { property: 'freeze', object: 'Object' },
      { property: 'myFavoriteWrapper' },
    ],
    linkComponents: ['Hyperlink', { name: 'Link', linkAttribute: 'to' }],
  },
  ignorePatterns: ['dist/**/*', '.jest/**/*', '**/*.config.js'],
};
