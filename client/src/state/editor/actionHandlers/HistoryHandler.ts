import { ActionType, EditorAction, EditorState } from "../EditorReducer";

// Helper function to save state to history
export function saveToHistory(state: EditorState): EditorState {
  // Create a deep copy of the current state
  const newState = JSON.parse(JSON.stringify(state));
  
  // If we're not at the end of the history array, remove all future states
  if (state.historyIndex < state.history.length - 1) {
    newState.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add current state to history
  newState.history.push({
    ...state,
    history: [], // Don't include history in the saved state
    historyIndex: -1 // Reset history index in the saved state
  });
  
  // Update history index
  newState.historyIndex = newState.history.length - 1;
  
  return newState;
}

// Handler for undo/redo actions
export function handleHistoryAction(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case ActionType.UNDO:
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...previousState,
          history: state.history,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;

    case ActionType.REDO:
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...nextState,
          history: state.history,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;

    default:
      return state;
  }
} 
