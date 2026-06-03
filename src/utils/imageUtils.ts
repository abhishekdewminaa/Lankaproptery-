export const getPropertyImage = (imagesVal: any): string => {
  const fallback = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
  if (!imagesVal) return fallback;
  if (Array.isArray(imagesVal)) {
    return imagesVal[0] || fallback;
  }
  if (typeof imagesVal === 'string') {
    try {
      const parsed = JSON.parse(imagesVal);
      if (Array.isArray(parsed)) return parsed[0] || fallback;
    } catch (e) {
      if (imagesVal.trim().startsWith('http')) return imagesVal;
    }
  }
  return fallback;
};
