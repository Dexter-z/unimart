export interface CategoryOption {
    value: string;
    label: string;
}

export const SHOP_CATEGORIES: CategoryOption[] = [
    { value: 'books', label: 'Books' },
    { value: 'gadgets', label: 'Gadgets' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'perfumes', label: 'Perfumes' },
    { value: 'kitchen_utensils', label: 'Kitchen utensils' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'bedroom_essentials', label: 'Bedroom essentials' },
    { value: 'food_and_pastries', label: 'Food and pastries' },
];

// Helper function to get label by value
export const getCategoryLabel = (value: string): string => {
    const category = SHOP_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
};

// Helper function to get value by label
export const getCategoryValue = (label: string): string => {
    const category = SHOP_CATEGORIES.find(cat => cat.label === label);
    return category ? category.value : label.toLowerCase().replace(/\s+/g, '_');
};

// Export just the labels for backwards compatibility
export const CATEGORY_LABELS = SHOP_CATEGORIES.map(cat => cat.label);
