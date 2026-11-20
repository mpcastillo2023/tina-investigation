// Docusaurus 3.1 development names include @docusaurus paths. The installed
// CSS pipeline double-escapes @, so selectors do not match the HTML classes.
module.exports = function demoCssModules() {
  return {
    name: 'demo-css-module-names',
    configureWebpack(config) {
      if (config.mode !== 'development') return {};
      for (const rule of config.module.rules) {
        for (const loader of Array.isArray(rule.use) ? rule.use : []) {
          if (loader.options?.modules) {
            loader.options.modules.localIdentName = '[local]_[contenthash:base64:5]';
          }
        }
      }
      return {};
    },
  };
};
