import { useEffect } from 'react';
import { useEditor } from './EditorReducer';
import { ActionType } from './EditorReducer';

export function useUndoRedo() {
  const { dispatch } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (undo) or Ctrl+Y/Ctrl+Shift+Z (redo)
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: ActionType.UNDO });
      } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        dispatch({ type: ActionType.REDO });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
} 
