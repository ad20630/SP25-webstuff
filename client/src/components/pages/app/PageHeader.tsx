import "styles/layout.css";
import { useSaveLoadActions } from "../../../state/editor/Helpers";
import { useState, useEffect } from "react";
import { useEditor } from "state/editor/EditorReducer";
import { ActionType } from "state/editor/EditorReducer";
import { usePages } from "state/pages/PagesContext";
import { useUndoRedo } from "state/editor/useUndoRedo";

const PageHeader = () => {
  const { saveToFile, loadFromFile, loadFromLocalStorage } = useSaveLoadActions();
  const { state: editorState, dispatch: editorDispatch } = useEditor();
  const { pages, currentPage, setCurrentPage } = usePages();
  const [saveMessage, setSaveMessage] = useState("Save");
  const [loadMessage, setLoadMessage] = useState("Load");

  // Initialize undo/redo functionality
  useUndoRedo();

  const handleSaveClick = () => {
    saveToFile(currentPage.toString());
    setSaveMessage("Saved!");
    setTimeout(() => {
      setSaveMessage("Save");
    }, 2000);
  };

  const handleLoadClick = () => {
    loadFromFile();
    setLoadMessage("Loaded!");
    setTimeout(() => setLoadMessage("Load"), 2000);
  };

  const handleUndo = () => {
    editorDispatch({ type: ActionType.UNDO });
  };

  const handleRedo = () => {
    editorDispatch({ type: ActionType.REDO });
  };

  const currentPageData = pages.find((page) => page.id === currentPage);

  return (
    <header className="header">
      <div className="header-left">
        <div className="page-info">
          <div className="page-name-section">
            <label htmlFor="pageName" className="page-label">
              Page name:
            </label>
            <span id="pageName" className="page-name">
              {currentPageData?.name || 'Untitled Page'}
            </span>
          </div>
          <div className="permalink-section">
            <span className="permalink-label">Permalink:</span>
            <span className="permalink">
              johndoe.com/<a href={`johndoe.com/${currentPageData?.subdomain || 'untitled'}`}>
                {currentPageData?.subdomain || 'untitled'}
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="header-middle">
        <span className="current-page-name">Current Page</span>
        <select 
          name="current-page" 
          className="current-page-dropdown"
          value={currentPage}
          onChange={(e) => {
            const newPageId = parseInt(e.target.value);
            setCurrentPage(newPageId);
            loadFromLocalStorage(newPageId.toString());
          }}
        >
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
      </div>

      <div className="header-right">
        <button
          className="undo-button"
          onClick={handleUndo}
          disabled={editorState.historyIndex <= 0}
        >
          Undo
        </button>
        <button
          className="redo-button"
          onClick={handleRedo}
          disabled={editorState.historyIndex >= editorState.history.length - 1}
        >
          Redo
        </button>
        <button className="save-button" onClick={handleSaveClick}>
          {saveMessage}
        </button>
        <button className="load-button" onClick={handleLoadClick}>
          {loadMessage}
        </button>
      </div>
    </header>
  );
};

export default PageHeader;

