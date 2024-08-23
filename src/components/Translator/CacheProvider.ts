type CacheProvider = {
  get: (language: string, key: string) => string | undefined;
  set: (language: string, key: string, translation: string) => void;
};

const cacheProvider: CacheProvider = {
  get: (language, key) => {
    const translations = JSON.parse(
      localStorage.getItem('translations') || '{}'
    );
    return translations[key]?.[language];
  },
  set: (language, key, value) => {
    const translations = JSON.parse(
      localStorage.getItem('translations') || '{}'
    );
    if (!translations[key]) {
      translations[key] = {};
    }
    translations[key][language] = value;
    localStorage.setItem('translations', JSON.stringify(translations));
  },
};

export default cacheProvider;
