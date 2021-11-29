module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/typescript'
  ],
  plugins: [
    '@babel/plugin-proposal-numeric-separator',
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    [
      'module-resolver',
      {
        alias: {
          '^@2bitlab/(.+)': '../\\1/src'
        }
      }
    ]
  ]
}
