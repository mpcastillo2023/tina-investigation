import test from 'node:test';
import assert from 'node:assert/strict';
import { installCategoryFolderAutomation } from '../tina/ensure-category.ts';

function setup({ existing, fetchError, createError, folderError } = {}) {
  const categories = [];
  const cms = {
    api: {
      admin: {
        createFolder: async () => {
          if (folderError) throw folderError;
        },
        fetchCollections: () => ['ES', 'EN', 'CA'].map((locale) => ({
          name: `categories${locale}`,
          path: locale === 'ES' ? 'docs' : `i18n/${locale.toLowerCase()}/docusaurus-plugin-content-docs/current`,
        })),
        fetchDocument: async (name, path) => {
          if (fetchError) throw fetchError;
          if (existing) return { document: { _values: existing } };
          const collection = ['ES', 'EN', 'CA'].map((locale) => ({
            name: `categories${locale}`,
            path: locale === 'ES' ? 'docs' : `i18n/${locale.toLowerCase()}/docusaurus-plugin-content-docs/current`,
          })).find((item) => item.name === name);
          throw new Error(`Unable to fetch, errors: \n\tUnable to find record ${collection.path}/${path}`);
        },
        createDocument: async (...args) => {
          if (createError) throw createError;
          categories.push(args);
        },
      },
      tina: { schema: { transformPayload: (name, payload) => ({ [name]: payload }) } },
    },
  };
  installCategoryFolderAutomation(cms);
  return { cms, categories };
}

test('creates a localized category document for a nested folder', async () => {
  const { cms, categories } = setup();
  await cms.api.admin.createFolder('docsES', 'visita/nuevo-menu');
  assert.equal(categories.length, 1);
  assert.equal(categories[0][0].name, 'categoriesES');
  assert.equal(categories[0][1], 'visita/nuevo-menu/_category_.json');
  assert.deepEqual(categories[0][2], { categoriesES: {
    _collection: 'categoriesES',
    label: 'Nuevo menu',
    collapsible: true,
    collapsed: false,
    link: { type: 'generated-index' },
  } });
});

test('preserves an existing category document', async () => {
  const { cms, categories } = setup({ existing: { label: 'My custom label' } });
  await cms.api.admin.createFolder('docsEN', 'custom-folder');
  assert.equal(categories.length, 0);
});

test('uses the matching Catalan category collection', async () => {
  const { cms, categories } = setup();
  await cms.api.admin.createFolder('docsCA', 'nova-seccio');
  assert.equal(categories[0][0].name, 'categoriesCA');
  assert.equal(categories[0][1], 'nova-seccio/_category_.json');
});

test('uses the matching English category collection', async () => {
  const { cms, categories } = setup();
  await cms.api.admin.createFolder('docsEN', 'new-section');
  assert.equal(categories[0][0].name, 'categoriesEN');
  assert.equal(categories[0][1], 'new-section/_category_.json');
});

test('installs only once and leaves other collection folder behavior alone', async () => {
  const { cms } = setup({ folderError: new Error('folder already exists') });
  const wrappedCreateFolder = cms.api.admin.createFolder;
  installCategoryFolderAutomation(cms);
  assert.equal(cms.api.admin.createFolder, wrappedCreateFolder);
  await assert.rejects(cms.api.admin.createFolder('categoriesES', 'new-category'), /folder already exists/);
});

test('allows retry after folder creation succeeded but category creation failed', async () => {
  let folderCalls = 0;
  let categoryCalls = 0;
  const cms = { api: { admin: {
    createFolder: async () => {
      if (++folderCalls > 1) throw new Error('Folder already exists');
    },
    fetchCollections: () => [{ name: 'categoriesES', path: 'docs' }],
    fetchDocument: async (name, path) => { throw new Error(`Unable to fetch, errors: \n\tUnable to find record docs/${path}`); },
    createDocument: async () => {
      if (++categoryCalls === 1) throw new Error('temporary category write failure');
    },
  }, tina: { schema: { transformPayload: (name, payload) => ({ [name]: payload }) } } } };
  installCategoryFolderAutomation(cms);
  await assert.rejects(cms.api.admin.createFolder('docsES', 'new-folder'), /temporary category write failure/);
  await cms.api.admin.createFolder('docsES', 'new-folder');
  assert.equal(folderCalls, 2);
  assert.equal(categoryCalls, 2);
});

test('propagates folder errors other than the known duplicate case', async () => {
  const { cms } = setup({ folderError: new Error('permission denied') });
  await assert.rejects(cms.api.admin.createFolder('docsES', 'new-folder'), /permission denied/);
});

test('propagates category lookup errors other than a missing document', async () => {
  const { cms, categories } = setup({ fetchError: new Error('Unable to fetch, errors: \n\tpermission denied') });
  await assert.rejects(cms.api.admin.createFolder('docsES', 'new-folder'), /permission denied/);
  assert.equal(categories.length, 0);
});
