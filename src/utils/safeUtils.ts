// ─── SAFE STRING UTILITIES ───────────────
export let USD_RATE = 300;
export let EUR_RATE = 325;

export const updateRates = (usd: number, eur: number) => {
  if (usd > 0) USD_RATE = usd;
  if (eur > 0) EUR_RATE = eur;
};

export const safeStr = (val: unknown): string => {
  if (val === null || val === undefined) return "";
  return String(val);
};

export const safeReplace = (
  val: unknown,
  search: string | RegExp,
  replaceWith: string,
): string => {
  if (val === null || val === undefined) return "";
  return String(val).replace(search, replaceWith);
};

export const formatPriceLong = (price: unknown): string => {
  if (price === null || price === undefined || price === "")
    return "Price on Request";
  const num = Number(String(price).replace(/[^0-9.-]/g, ""));
  if (isNaN(num) || num === 0) return "Price on Request";
  return `Rs. ${num.toLocaleString()}`;
};

export const formatUSDShort = (price: unknown): string => {
  if (!price) return "";
  const num = Number(price);
  if (isNaN(num)) return "";
  return `$${Math.round(num / 300).toLocaleString()}`;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const removeSinhala = (text: string): string => {
  if (!text) return "";
  const match = text.match(/[\u0D80-\u0DFF]/);
  if (match && match.index !== undefined) {
    let cleaned = text.substring(0, match.index);
    cleaned = cleaned.replace(/[\s\-\/.,:;(|]+$/, "").trim();
    return cleaned;
  }
  return text;
};

export const getFirstImageSafe = (images: unknown): string => {
  const fallback =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop";
  if (!images) return fallback;
  if (Array.isArray(images) && images.length > 0) {
    return images[0] || fallback;
  }
  if (typeof images === "string") {
    try {
      if (images.startsWith("[") && images.endsWith("]")) {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed[0] || fallback;
      }
      return images;
    } catch {
      return images;
    }
  }
  return fallback;
};

// Safe Local Storage wrapper to prevent SecurityError / Access Denied crashes in iframe preview environments
export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem blocked by browser security:", e);
      return (window as any).__memStorage?.[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem blocked by browser security:", e);
      if (!(window as any).__memStorage) (window as any).__memStorage = {};
      (window as any).__memStorage[key] = String(value);
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage.removeItem blocked by browser security:", e);
      if ((window as any).__memStorage) {
        delete (window as any).__memStorage[key];
      }
    }
  },
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      console.warn("localStorage.clear blocked by browser security:", e);
      (window as any).__memStorage = {};
    }
  }
};

// ─────────────────────────────────────────
