import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const siteUrl = process.env.RENDER_EXTERNAL_URL || 'https://tina-investigation.onrender.com';

const config: Config = {
  title: 'Aurora Hall — Tina demo',
  tagline: 'A fictional venue guide and CMS demo',
  favicon: 'img/logo.svg',
  url: siteUrl,
  baseUrl: '/',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  customFields: {cmsName: 'TinaCMS'},
  i18n: {defaultLocale: 'es', locales: ['es', 'en', 'ca'], localeConfigs: {en: {label: 'English'}, es: {label: 'Español'}, ca: {label: 'Català'}}},
  plugins: [require.resolve('./scripts/css-module-names.cjs'), require.resolve('docusaurus-lunr-search')],
  presets: [['classic', {docs: {sidebarPath: './sidebars.ts', editUrl: () => `${siteUrl}/admin/`}, theme: {customCss: './src/css/custom.css'}} satisfies Preset.Options]],
  themeConfig: {navbar: {title: 'Aurora Hall', logo: {alt: 'Aurora Hall', src: 'img/logo.svg'}, items: [{type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Guide'}, {type: 'localeDropdown', position: 'right'}, {href: `${siteUrl}/admin/`, label: 'Edit', position: 'right'}]}, footer: {style: 'dark', copyright: `Aurora Hall demo · ${new Date().getFullYear()}`}, prism: {theme: prismThemes.github}} satisfies Preset.ThemeConfig,
};
export default config;
