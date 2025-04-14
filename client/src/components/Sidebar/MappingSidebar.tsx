import React, { useState } from 'react';
import { useSaveLoadActions } from 'state/editor/Helpers';
import { usePages } from 'state/pages/PagesContext';

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
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const { pages, currentPage, setCurrentPage, addPage, deletePage, updatePage } = usePages();
  const { loadFromLocalStorage, saveToLocalStorage } = useSaveLoadActions();

  const handlePageClick = (pageId: number) => {
    setSelectedPage(selectedPage === pageId ? null : pageId);
  };

  const handleSwitchPage = (pageId: number) => {
    if (currentPage !== null) {
      saveToLocalStorage(currentPage.toString());
    }
    setCurrentPage(pageId);
    loadFromLocalStorage(pageId.toString());
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
                onDelete={() => deletePage(page.id)}
                onClose={() => setSelectedPage(null)}
                onUpdate={(name, subdomain) => updatePage(page.id, name, subdomain)}
              />
            )}
          </div>
        ))}
        <button 
          className="add-page-button"
          onClick={addPage}
        >
          + Add Page
        </button>
      </div>
    </aside>
  );
}

export default MappingSidebar;
