import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { contentsApi, type ContentFromAPI } from '@/lib/api';

interface CMSContextType {
  contents: Record<string, string>;
  isLoaded: boolean;
}

const CMSContext = createContext<CMSContextType>({ contents: {}, isLoaded: false });

export const useCMS = () => useContext(CMSContext);

/** Get a CMS value with a fallback */
export const useCMSValue = (key: string, fallback: string = '') => {
  const { contents } = useCMS();
  return contents[key] || fallback;
};

export const CMSProvider = ({ children }: { children: ReactNode }) => {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    contentsApi.list()
      .then((data) => {
        const map: Record<string, string> = {};
        Object.values(data).forEach((c: ContentFromAPI) => {
          map[c.content_key] = c.value;
        });
        setContents(map);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  return (
    <CMSContext.Provider value={{ contents, isLoaded }}>
      {children}
    </CMSContext.Provider>
  );
};
