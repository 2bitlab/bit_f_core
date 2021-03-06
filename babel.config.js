module.exports = {
  presets: ['@babel/preset-env', '@babel/typescript'],
  plugins: [
    '@babel/plugin-proposal-numeric-separator',
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-transform-runtime'
  ]
}
