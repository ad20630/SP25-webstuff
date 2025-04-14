import React, { useState, useEffect } from 'react';
import { useSaveLoadActions } from 'state/editor/Helpers';

type Page = {
  id: number;
  name: string;
  subdomain: string;
}

type Props = {}

const PageMenu = ({ page, onDelete, onClose, onSwitch, onUpdate }: { 
  page: Page, 
  onDelete: () => void, 
  onClose: () => void,
  onSwitch: () => void,
  onUpdate: (name: string, subdomain: string) => void
}) => {
  const [pagename, setPagename] = useState(page.name);
  const [subdomain, setSubdomain] = useState(page.subdomain);

  const handlePagenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setPagename(newName);
    onUpdate(newName, subdomain);
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubdomain = e.target.value;
    setSubdomain(newSubdomain);
    onUpdate(pagename, newSubdomain);
  };

  return (
    <div className="page-menu">
      <input
        type="text"
        className="text-input"
        placeholder="Page Name"
        value={pagename}
        onChange={handlePagenameChange}
      />
      <input
        type="text"
        className="text-input"
        placeholder="Subdomain"
        value={subdomain}
        onChange={handleSubdomainChange}
      />
      <button className="menu-button switch-button" onClick={onSwitch}>Switch to Page</button>
      <button className="menu-button delete-button" onClick={onDelete}>Delete Page</button>
      <button className="menu-button close-button" onClick={onClose}>Close</button>
    </div>
  );
};

const MappingSidebar = (props: Props) => {
  const [pages, setPages] = useState<Page[]>(() => {
    const savedPages = localStorage.getItem('Pages');
    return savedPages ? JSON.parse(savedPages) : [{ id: 1, name: 'Page 1', subdomain: 'page-1' }];
  });
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [editingPage, setEditingPage] = useState<number | null>(() => {
    const savedEditingPage = localStorage.getItem('currentEditingPage');
    return savedEditingPage ? parseInt(savedEditingPage) : 1;
  });
  const { loadFromLocalStorage, saveToLocalStorage } = useSaveLoadActions();

  // Save current editing page whenever it changes
  useEffect(() => {
    if (editingPage !== null) {
      localStorage.setItem('currentEditingPage', editingPage.toString());
    }
  }, [editingPage]);

  useEffect(() => {
    localStorage.setItem('Pages', JSON.stringify(pages));
  }, [pages]);

  const handleAddPage = () => {
    const newId = pages.length + 1;
    setPages([...pages, { id: newId, name: `Page ${newId}`, subdomain: `page-${newId}` }]);
  };

  const handlePageClick = (pageId: number) => {
    setSelectedPage(selectedPage === pageId ? null : pageId);
  };

  const handleDeletePage = (pageId: number) => {
    setPages(pages.filter(p => p.id !== pageId));
    setSelectedPage(null);
  };

  const handleSwitchPage = (pageId: number) => {
    if (editingPage !== null) {
      saveToLocalStorage(editingPage.toString());
    }
    setEditingPage(pageId);
    loadFromLocalStorage(pageId.toString());
  };

  const handleUpdatePage = (pageId: number, name: string, subdomain: string) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, name, subdomain } : page
    ));
  };

  return (
    <aside className='style-sidebar'>
      <header className='sidebar-header'>
        <h2>PAGES</h2>
      </header>
      <div className="grid-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {pages.map((page) => (
          <div key={page.id} className="page-container">
            <button 
              className={`page-button ${selectedPage === page.id ? 'selected' : ''}`}
              onClick={() => handlePageClick(page.id)}
            >
              {page.name}
            </button>
            {selectedPage === page.id && (
              <PageMenu 
                page={page}
                onSwitch={() => handleSwitchPage(page.id)}
                onDelete={() => handleDeletePage(page.id)}
                onClose={() => setSelectedPage(null)}
                onUpdate={(name, subdomain) => handleUpdatePage(page.id, name, subdomain)}
              />
            )}
          </div>
        ))}
        <button 
          className="add-page-button"
          onClick={handleAddPage}
        >
          + Add Page
        </button>
      </div>
    </aside>
  );
}

export default MappingSidebar;
