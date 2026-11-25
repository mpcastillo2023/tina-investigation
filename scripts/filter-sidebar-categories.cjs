'use strict';

function filterHiddenCategories(items) {
  return items.flatMap((item) => {
    if (item.customProps?.showInMenu === false) {
      return [];
    }

    if (item.type === 'category' && Array.isArray(item.items)) {
      return [{...item, items: filterHiddenCategories(item.items)}];
    }

    return [item];
  });
}

async function sidebarItemsGenerator({defaultSidebarItemsGenerator, ...generatorArgs}) {
  const generatedItems = await defaultSidebarItemsGenerator(generatorArgs);
  return filterHiddenCategories(generatedItems);
}

module.exports = {filterHiddenCategories, sidebarItemsGenerator};
