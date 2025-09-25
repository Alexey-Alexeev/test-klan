export const DATA_SCHEMAS = {
  shop: {
    name: 'string',
    rating: 'number',
    reviewsCount: 'number',
    selected: 'boolean',
    description: 'string'
  },
  products: {
    title: 'string',
    price: 'number',
    image: 'string',
    selected: 'boolean',
    quantity: 'number',
    description: 'string',
    category: 'string'
  },
  orders: {
    total: 'number',
    count: 'number',
    status: 'string',
    date: 'string'
  }
};

export function getFieldsForCollection(collection: string) {
  const schema = DATA_SCHEMAS[collection as keyof typeof DATA_SCHEMAS];
  
  if (!schema) return [];
  
  return Object.entries(schema).map(([name, type]) => ({
    name,
    type,
    label: `${name} (${type})`
  }));
}

export function getAvailableCollections() {
  return Object.keys(DATA_SCHEMAS).map(key => ({
    value: key,
    label: key === 'shop' ? 'Магазины' : 
           key === 'products' ? 'Товары' : 
           key === 'orders' ? 'Заказы' : key
  }));
}

export function getRecommendedAlias(collection: string): string {
  const aliasMap: Record<string, string> = {
    'shop': 'shop',
    'products': 'product', 
    'orders': 'order'
  };
  
  return aliasMap[collection] || 'item';
}

export function getAliasOptions(collection: string): Array<{value: string, label: string}> {
  const recommended = getRecommendedAlias(collection);
  
  const commonOptions = [
    { value: 'item', label: 'item (по умолчанию)' },
    { value: 'element', label: 'element' },
    { value: 'record', label: 'record' },
    { value: 'entry', label: 'entry' },
    { value: 'data', label: 'data' }
  ];
  
  // Добавляем рекомендуемый вариант в начало списка
  const recommendedOption = { 
    value: recommended, 
    label: `${recommended} (рекомендуется для ${collection})` 
  };
  
  // Убираем дубликаты и возвращаем список
  const allOptions = [recommendedOption, ...commonOptions];
  const uniqueOptions = allOptions.filter((option, index, self) => 
    index === self.findIndex(o => o.value === option.value)
  );
  
  return uniqueOptions;
}
