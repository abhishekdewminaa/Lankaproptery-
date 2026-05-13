export const safeString = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val);
};

export const formatPrice = (price: any): string => {
  if (!price && price !== 0) return 'Rs. 0';
  const num = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 'Rs. 0';
  return `Rs. ${num.toLocaleString()}`;
};

export const getImageUrl = (images: any): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop';
  }
  return images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop';
};
