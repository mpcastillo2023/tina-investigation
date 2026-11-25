import { defineConfig } from 'tinacms';
import { installCategoryFolderAutomation } from './ensure-category';

const documentFields = (labels: {title: string; description: string; menu: string; position: string; body: string; showInMenu: string}) => [
  { type: 'string' as const, name: 'title', label: labels.title, required: false },
  { type: 'string' as const, name: 'description', label: labels.description },
  { type: 'string' as const, name: 'sidebar_label', label: labels.menu },
  { type: 'number' as const, name: 'sidebar_position', label: labels.position },
  { type: 'object' as const, name: 'sidebar_custom_props', label: 'Menu options', fields: [{ type: 'boolean' as const, name: 'showInMenu', label: labels.showInMenu }] },
  { type: 'rich-text' as const, name: 'body', label: labels.body, isBody: true },
];

const categoryFields = (labels: {label: string; position: string; collapsible: string; collapsed: string; showInMenu: string}) => [
  { type: 'string' as const, name: 'label', label: labels.label, isTitle: true, required: true },
  { type: 'number' as const, name: 'position', label: labels.position },
  { type: 'boolean' as const, name: 'collapsible', label: labels.collapsible, ui: { component: null } },
  { type: 'boolean' as const, name: 'collapsed', label: labels.collapsed, ui: { component: null } },
  { type: 'object' as const, name: 'customProps', label: 'Menu options', fields: [{ type: 'boolean' as const, name: 'showInMenu', label: labels.showInMenu }] },
  {
    type: 'object' as const,
    name: 'link',
    label: 'Docusaurus category link',
    ui: { component: null },
    fields: [
      { type: 'string' as const, name: 'type', label: 'Type' },
      { type: 'string' as const, name: 'title', label: 'Title' },
      { type: 'string' as const, name: 'description', label: 'Description' },
      { type: 'string' as const, name: 'slug', label: 'Slug' },
      { type: 'string' as const, name: 'id', label: 'Document ID' },
    ],
  },
];

const locales = [
  {
    locale: 'es',
    label: 'Español',
    documentPath: 'docs',
    title: 'Título', description: 'Descripción', menu: 'Nombre en el menú', position: 'Posición en el menú', body: 'Contenido', showInMenu: 'Mostrar en el menú',
    categoryLabel: 'Categorías del menú',
  },
  {
    locale: 'en',
    label: 'English',
    documentPath: 'i18n/en/docusaurus-plugin-content-docs/current',
    title: 'Title', description: 'Description', menu: 'Sidebar label', position: 'Sidebar position', body: 'Content', showInMenu: 'Show in menu',
    categoryLabel: 'Menu categories',
  },
  {
    locale: 'ca',
    label: 'Català',
    documentPath: 'i18n/ca/docusaurus-plugin-content-docs/current',
    title: 'Títol', description: 'Descripció', menu: 'Nom al menú', position: 'Posició al menú', body: 'Contingut', showInMenu: 'Mostrar al menú',
    categoryLabel: 'Categories del menú',
  },
];

export default defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  telemetry: 'disabled',
  cmsCallback: installCategoryFolderAutomation,
  build: {
    publicFolder: 'static',
    outputFolder: 'admin',
  },
  media: {
    tina: {
      publicFolder: 'static',
      mediaRoot: 'media',
    },
  },
  schema: {
    collections: locales.flatMap((locale) => [
      {
        name: `docs${locale.locale.toUpperCase()}`,
        label: locale.label,
        path: locale.documentPath,
        format: 'md',
        fields: documentFields(locale),
      },
      {
        name: `categories${locale.locale.toUpperCase()}`,
        label: locale.categoryLabel,
        path: locale.documentPath,
        format: 'json',
        match: { include: '**/_category_' },
        ui: {
          filename: { slugify: () => '_category_' },
          defaultItem: { collapsible: true, collapsed: false, link: { type: 'generated-index' } },
        },
        fields: categoryFields({
          label: locale.locale === 'es' ? 'Nombre en el menú' : locale.locale === 'en' ? 'Menu name' : 'Nom al menú',
          position: locale.position,
          collapsible: locale.locale === 'es' ? 'Plegable' : locale.locale === 'en' ? 'Collapsible' : 'Plegable',
          collapsed: locale.locale === 'es' ? 'Plegada por defecto' : locale.locale === 'en' ? 'Collapsed by default' : 'Plegada per defecte',
          showInMenu: locale.showInMenu,
        }),
      },
    ]),
  },
});
