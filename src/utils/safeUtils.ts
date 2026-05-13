// ─── SAFE STRING UTILITIES ───────────────
export const USD_RATE = 300;
export const EUR_RATE = 325;

export const safeStr = (val: unknown): string => {
  if (val === null || val === undefined) return ''
  return String(val)
}

export const safeReplace = (
  val: unknown, 
  search: string | RegExp, 
  replaceWith: string
): string => {
  if (val === null || val === undefined) return ''
  return String(val).replace(search, replaceWith)
}

export const formatPriceLong = (price: unknown): string => {
  if (price === null || price === undefined || price === '') return 'Price on Request'
  const num = Number(String(price).replace(/[^0-9.-]/g, ''))
  if (isNaN(num) || num === 0) return 'Price on Request'
  return `Rs. ${num.toLocaleString()}`
}

export const formatUSDShort = (price: unknown): string => {
  if (!price) return ''
  const num = Number(price)
  if (isNaN(num)) return ''
  return `$${Math.round(num / 300).toLocaleString()}`
}

export const getFirstImageSafe = (images: unknown): string => {
  const fallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop';
  if (!images) return fallback;
  if (Array.isArray(images) && images.length > 0) {
    return images[0] || fallback;
  }
  if (typeof images === 'string') {
    try {
      if (images.startsWith('[') && images.endsWith(']')) {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed[0] || fallback;
      }
      return images;
    } catch { 
      return images;
    }
  }
  return fallback;
}
// ─────────────────────────────────────────
