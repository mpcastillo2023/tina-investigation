// Compile a real theme CSS module through Docusaurus's installed loader chain.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const webpack = require('webpack');
const MiniCss = require('mini-css-extract-plugin');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const {getStyleLoaders} = require('@docusaurus/core/lib/webpack/utils');
const sitePath = path.resolve(process.argv[2] || path.join(__dirname, '..', 'docusaurus.config.ts'));
const imported = require('jiti')(__filename)(sitePath);
const site = imported.default || imported;
const factory = site.plugins.map(item => typeof item === 'string' ? require(item) : item)
  .find(item => typeof item === 'function' && item.name === 'demoCssModules');
assert.ok(factory, `${sitePath} must install the CSS module naming fix`);
const plugin = factory();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-216-css-'));
const style = require.resolve('@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css');
fs.writeFileSync(path.join(temporary, 'entry.js'), `import styles from ${JSON.stringify(style)}; export default styles;`);
const config = {
  mode: 'development',
  context: process.cwd(),
  entry: path.join(temporary, 'entry.js'),
  output: {path: path.join(temporary, 'out'), filename: 'check.cjs', library: {type: 'commonjs2'}, publicPath: ''},
  module: {rules: [{test: /\.css$/, use: getStyleLoaders(false, {modules: {localIdentName: '[local]_[path][name]'}})}]},
  plugins: [new MiniCss({filename: 'check.css'})],
};
if (!process.env.CHECK_WITHOUT_FIX) plugin.configureWebpack(config);
const production = {mode: 'production'};
assert.deepEqual(plugin.configureWebpack(production), {}, 'Production naming must stay unchanged');
const compiler = webpack(config);
compiler.run((error, stats) => {
  compiler.close(closeError => {
    try {
      if (error || closeError) throw error || closeError;
      assert.ok(!stats.hasErrors(), stats.toString({all: false, errors: true}));
      const exported = require(path.join(temporary, 'out/check.cjs')).default;
      const css = fs.readFileSync(path.join(temporary, 'out/check.css'), 'utf8');
      const classes = new Set();
      postcss.parse(css).walkRules(rule => selectorParser(root => root.walkClasses(node => classes.add(node.value))).processSync(rule.selector));
      for (const name of ['docRoot', 'docsWrapper']) {
        assert.ok(classes.has(exported[name]), `${name}: HTML class does not match emitted CSS selector`);
      }
      assert.match(css, /display:\s*flex/, 'Theme must retain its desktop flex layout');
      console.log('PASS: real Docusaurus theme class names match emitted CSS; desktop flex rules preserved.');
    } catch (failure) {
      console.error(failure.message);
      process.exitCode = 1;
    } finally {
      fs.rmSync(temporary, {recursive: true, force: true});
    }
  });
});
