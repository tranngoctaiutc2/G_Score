const DEFAULT_TTL_MS = 10 * 60 * 1000;

export const setCache = (key, data, ttl = DEFAULT_TTL_MS) => {
  const record = {
    timestamp: Date.now(),
    ttl,
    data,
  };
  localStorage.setItem(key, JSON.stringify(record));
};

export const getCache = (key) => {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const record = JSON.parse(item);
    const now = Date.now();
    if (now - record.timestamp > record.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return record.data;
  } catch (e) {
    console.error('Lỗi khi đọc cache:', e);
    return null;
  }
};

export const clearCache = (key) => {
  localStorage.removeItem(key);
};
