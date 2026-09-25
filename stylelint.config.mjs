/** @type {import('stylelint').Config} */
const stylelintConfig = {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/.angular/**'],
  rules: {
    'no-empty-source': null,
    'no-descending-specificity': null,
    'comment-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'hue-degree-notation': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    'media-feature-range-notation': null,
    'font-family-name-quotes': null,
    'number-max-precision': null,
    'custom-property-pattern': null,
    'selector-class-pattern':
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['host', 'host-context', 'global', 'deep'],
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['ng-deep'],
      },
    ],
  },
};

export default stylelintConfig;
