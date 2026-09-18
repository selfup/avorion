const register = require('@babel/register').default;

register({
  babelrc: false,
  configFile: false,
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'classic', pragma: 'h' }],
  ],
  ignore: [/node_modules/],
  extensions: ['.js'],
});