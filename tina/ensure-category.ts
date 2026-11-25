const installed = Symbol('tina-category-folder-automation');

export function installCategoryFolderAutomation(cms: any) {
  const admin = cms.api.admin;
  const originalCreateFolder = admin.createFolder;
  if (originalCreateFolder[installed]) return cms;

  const createFolder = async (collectionName: string, folderName: string) => {
    const docsLocale = /^docs(ES|EN|CA)$/.exec(collectionName)?.[1];
    if (!docsLocale) return originalCreateFolder.call(admin, collectionName, folderName);

    try {
      await originalCreateFolder.call(admin, collectionName, folderName);
    } catch (error) {
      // A prior attempt may have created the folder before category creation failed.
      if (!(error instanceof Error) || !/already exists/i.test(error.message)) throw error;
    }

    const categoryName = `categories${docsLocale}`;
    const category = admin.fetchCollections().find((item: any) => item.name === categoryName);
    if (!category) throw new Error(`Tina category collection ${categoryName} was not found`);

    const relativePath = `${folderName.replace(/\\/g, '/')}/_category_.json`;
    let current;
    try {
      current = await admin.fetchDocument(categoryName, relativePath);
    } catch (error) {
      const targetPath = `${category.path}/${relativePath}`;
      const messages = error instanceof Error
        ? error.message.replace(/^Unable to fetch, errors:\s*/, '').split('\n').map((line) => line.trim()).filter(Boolean)
        : [];
      if (!messages.length || !messages.every((message) => message === `Unable to find record ${targetPath}`)) throw error;
    }
    if (current?.document) return;

    const label = folderName.split('/').pop()!.replace(/[-_]+/g, ' ');
    const title = label.charAt(0).toLocaleUpperCase() + label.slice(1);
    const payload = cms.api.tina.schema.transformPayload(categoryName, {
      _collection: categoryName,
      label: title,
      collapsible: true,
      collapsed: false,
      link: { type: 'generated-index' },
    });
    await admin.createDocument(category, relativePath, payload);
  };

  Object.defineProperty(createFolder, installed, { value: true });
  admin.createFolder = createFolder;
  return cms;
}
