# @2bitlab/stylelint

2bitlab 前端 vue 项目代码规范 `stylelint`

## 安装

- `npm i @2bitlab/eslint-config-vue-prettier-ts --dev` or
- `yarn add @2bitlab/eslint-config-vue-prettier-ts -D`

> 使用 yarn 如果出现错误的话 需要补充安装 `yarn add eslint-plugin-prettier@latest -D`

## 配置

```js
module.exports = {
  extends: [
    // Use the Standard config as the base
    // https://github.com/stylelint/stylelint-config-standard
    'stylelint-config-standard',
    // Enforce a standard order for CSS properties
    // https://github.com/stormwarning/stylelint-config-recess-order
    'stylelint-config-recess-order',
    // Override rules that would interfere with Prettier
    // https://github.com/shannonmoeller/stylelint-config-prettier
    'stylelint-config-prettier',
    // Override rules to allow linting of CSS modules
    // https://github.com/pascalduez/stylelint-config-css-modules
    'stylelint-config-css-modules',
    //https://github.com/zhilidali/stylelint-config-tailwindcss
    'stylelint-config-tailwindcss'
  ],
  plugins: [
    // Bring in some extra rules for SCSS
    'stylelint-scss'
  ],
  // Rule lists:
  // - https://stylelint.io/user-guide/rules/
  // - https://github.com/kristerkari/stylelint-scss#list-of-rules
  rules: {
    // Allow newlines inside class attribute values
    'string-no-newline': null,
    // Enforce camelCase for classes and ids, to work better
    // with CSS modules
    'selector-class-pattern':
      /^[a-z][a-z-_A-Z0-9]*(-(enter|leave)(-(active|to))?)?$/,
    'selector-id-pattern': /^[a-z][a-zA-Z]*$/,
    // Limit the number of universal selectors in a selector,
    // to avoid very slow selectors
    'selector-max-universal': 1,
    // Disallow allow global element/type selectors in scoped modules
    // 'selector-max-type': [0, { ignore: ['child', 'descendant', 'compounded'] }],
    // ===
    // SCSS
    // ===
    'scss/dollar-variable-colon-space-after': 'always',
    'scss/dollar-variable-colon-space-before': 'never',
    'scss/dollar-variable-no-missing-interpolation': true,
    'scss/dollar-variable-pattern': /^[a-z-A-Z-0-9]+$/,
    'scss/double-slash-comment-whitespace-inside': 'always',
    'scss/operator-no-newline-before': true,
    'scss/operator-no-unspaced': true,
    'scss/selector-no-redundant-nesting-selector': true,
    // Allow SCSS and CSS module keywords beginning with `@`
    'at-rule-no-unknown': null,
    // 'scss/at-rule-no-unknown': true,
    'font-family-no-missing-generic-family-keyword': null,
    'no-descending-specificity': null,
    'selector-type-no-unknown': null,
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ],
    'length-zero-no-unit': null
  }
}
```
