import React, { createContext, useContext, useState, useEffect } from 'react';

export type Page = {
  id: number;
  name: string;
  subdomain: string;
}

type PagesContextType = {
  pages: Page[];
  currentPage: number;
  setPages: (pages: Page[]) => void;
  setCurrentPage: (pageId: number) => void;
  addPage: () => void;
  deletePage: (pageId: number) => void;
  updatePage: (pageId: number, name: string, subdomain: string) => void;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);

export const PagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>(() => {
    const savedPages = localStorage.getItem('Pages');
    return savedPages ? JSON.parse(savedPages) : [{ id: 1, name: 'Page 1', subdomain: 'page-1' }];
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const savedEditingPage = localStorage.getItem('currentEditingPage');
    return savedEditingPage ? parseInt(savedEditingPage) : 1;
  });

  useEffect(() => {
    localStorage.setItem('Pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('currentEditingPage', currentPage.toString());
  }, [currentPage]);

  const addPage = () => {
    const newId = pages.length + 1;
    setPages([...pages, { id: newId, name: `Page ${newId}`, subdomain: `page-${newId}` }]);
  };

  const deletePage = (pageId: number) => {
    setPages(pages.filter(p => p.id !== pageId));
    if (currentPage === pageId) {
      setCurrentPage(1);
    }
  };

  const updatePage = (pageId: number, name: string, subdomain: string) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, name, subdomain } : page
    ));
  };

  return (
    <PagesContext.Provider value={{
      pages,
      currentPage,
      setPages,
      setCurrentPage,
      addPage,
      deletePage,
      updatePage
    }}>
      {children}
    </PagesContext.Provider>
  );
};

export const usePages = () => {
  const context = useContext(PagesContext);
  if (context === undefined) {
    throw new Error('usePages must be used within a PagesProvider');
  }
  return context;
}; 
