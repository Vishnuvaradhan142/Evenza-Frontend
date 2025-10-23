const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

const suppressDocxPreviewSourceMapWarnings = (config) => {
  // Exclude docx-preview from source-map-loader to avoid noisy sourcemap warnings
  const rules = config.module && config.module.rules ? config.module.rules : [];
  for (const r of rules) {
    if (r && r.enforce === 'pre' && r.use) {
      const uses = Array.isArray(r.use) ? r.use : [r.use];
      const hasSourceMapLoader = uses.some((u) => {
        const loader = (u && (u.loader || u)) || '';
        return typeof loader === 'string' && loader.includes('source-map-loader');
      });
      if (hasSourceMapLoader) {
        const docxRegex = /node_modules[\\\/]docx-preview[\\\/]/;
        if (!r.exclude) r.exclude = docxRegex;
        else if (Array.isArray(r.exclude)) r.exclude.push(docxRegex);
        else r.exclude = [r.exclude, docxRegex];
      }
    }
  }
  // Add ignoreWarnings entry as an extra safety net
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    (warning) => typeof warning.message === 'string' && warning.message.includes('Failed to parse source map') && warning.message.includes('docx-preview')
  ];
  return config;
};

module.exports = override(
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src'),
  }),
  suppressDocxPreviewSourceMapWarnings
);