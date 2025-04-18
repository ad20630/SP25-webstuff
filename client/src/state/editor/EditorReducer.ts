// #region reducer definition

import { Key, useContext } from "react";
import { EditorContext } from "state/editor/EditorContext";
import { StorableHtmlNode } from "types/HtmlNodes";
import { HtmlObject } from "types/HtmlObject";
import { handleMouseMovementAction } from "./actionHandlers/MouseMovementHandler";
import { handleDragAndDropAction } from "./actionHandlers/DragAndDropHandler";
import { handleDataFetchingAction } from "./actionHandlers/DataFetchingHandler";
import { handleFocusedElementAction } from "./actionHandlers/FocusedElementHandler";
import { handleDeleteAction } from "./actionHandlers/DeleteHandler";
import { MouseState } from "state/mouse/MouseReducer";
import { handleCopyAction } from "./actionHandlers/copyHandler";
import { handleLoadStateAction } from "./actionHandlers/LoadStateHandler";
import { handleUndoRedoAction } from "./actionHandlers/UndoRedoHandler";
import { handleAddAction } from "./actionHandlers/addHandler";
import { handleResizeAction } from "./actionHandlers/ResizeHandler";
import { handleAttributeAction } from "./actionHandlers/AttributeHandler";
import { DragAndDropState } from "state/dragAndDrop/DragAndDropReducer";
import { parseId } from "./Helpers";
import { findPrimaryNode, sanitizeClassName, sanitizeImageUrl, sanitizeWidthOrHeight } from "components/pages/app/Helpers";


// #region type and constant definitions

// Define action types
export enum ActionType {
  START_DRAG = "START_DRAG",
  DRAG_OVER = "DRAG_OVER",
  DRAG_OUT = "DRAG_OUT",
  DROP = "DROP",
  CANCEL_DRAG = "CANCEL_DRAG",
  DELETE_ELEMENT = "DELETE_ELEMENT",  
  COPY_ELEMENT = "COPY_ELEMENT",
  ADD_ELEMENT = "ADD_ELEMENT",
  ADD_COLUMN = "ADD_COLUMN",
  RESIZE_ELEMENT = "RESIZE_ELEMENT",
  CHANGE_COLUMN_DIRECTION = "CHANGE_COLUMN_DIRECTION",

  VIEW_CODE = "VIEW_CODE",
  LOAD_STATE = "LOAD_STATE",

  HOVER = "HOVER",
  UNHOVER = "UNHOVER",

  FETCHED_WIDGETS = "FETCHED_WIDGETS",
  
  ELEMENT_SELECTED = "ELEMENT_SELECTED",
  ELEMENT_DOUBLE_CLICKED = "ELEMENT_DOUBLE_CLICKED",
  ELEMENT_BLURRED = "ELEMENT_BLURRED",
  ELEMENT_UNSELECTED = "ELEMENT_UNSELECTED",

  ATTRIBUTE_CHANGED = "ATTRIBUTE_CHANGED",
  UNDO = "UNDO",
  REDO = "REDO"
}

export type EditorAction =
  | { type: ActionType.HOVER; mouseState:MouseState; dragState:DragAndDropState, payload: string }
  | { type: ActionType.UNHOVER; mouseState:MouseState; payload: string }
  | { type: ActionType.START_DRAG; payload: number | string; dragRootId?: string }
  | { type: ActionType.DRAG_OVER; targetId: string, payload:any, mouseState:MouseState }
  | { type: ActionType.DRAG_OUT; targetId: string}
  | { type: ActionType.DROP; mouseState:MouseState; payload: HtmlObject; targetId: string; }
  | { type: ActionType.ELEMENT_SELECTED; selectedId: string; }
  | { type: ActionType.ELEMENT_UNSELECTED; }
  | { type: ActionType.ELEMENT_DOUBLE_CLICKED; containerId:string, elementId:string }
  | { type: ActionType.ELEMENT_BLURRED; elementId:string }
  | { type: ActionType.CANCEL_DRAG }
  | { type: ActionType.FETCHED_WIDGETS; widgets: HtmlObject[] }
  | { type: ActionType.DELETE_ELEMENT; elementId: string }
  | { type: ActionType.COPY_ELEMENT; elementId: string }
  | { type: ActionType.VIEW_CODE; elementId: string }
  | { type: ActionType.ATTRIBUTE_CHANGED; target:"style"|"attributes"; attribute:string; newValue:string }
  | { type: ActionType.LOAD_STATE; payload: EditorState }
  | { type: ActionType.ADD_ELEMENT; elementId: string}
  | { type: ActionType.ADD_COLUMN; elementId: string}
  | { type: ActionType.RESIZE_ELEMENT; elementId: string; width: number; height: number }
  | { type: ActionType.CHANGE_COLUMN_DIRECTION; elementId: string; direction: "horizontal" | "vertical" }
  | { type: ActionType.UNDO }
  | { type: ActionType.REDO }


export type EditorState = {
  isDragging: boolean;
  isEditing: boolean;
  draggedItemId: number | string | null;
  hoveredItemId: string | null;
  selectedElementId: string | null;
  cursorPosition: {row:number, col:number} | null;
  widgets: HtmlObject[];
  header: HtmlObject;
  body: HtmlObject;
  footer: HtmlObject;
  history: EditorState[];
  historyIndex: number;
};

export type DropTargetData = {
  section: "header" | "body" | "footer";
  dropPositionId: number;
};

// #endregion

// Define a reducer to manage the state of the editor
export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  let newState = state;
  
  // Handle undo/redo actions first
  if (action.type === ActionType.UNDO || action.type === ActionType.REDO) {
    return handleUndoRedoAction(state, action);
  }

  // Handle attribute changes
  if (action.type === ActionType.ATTRIBUTE_CHANGED) {
    return handleAttributeAction(state, action);
  }

  // Group actions for action handler delegation //
  const MouseMovementActions = [
    ActionType.HOVER,
    ActionType.UNHOVER,
  ]

  const DragAndDropActions = [
    ActionType.START_DRAG,
    ActionType.DRAG_OVER,
    ActionType.DROP,
    ActionType.CANCEL_DRAG
  ]

  const DataFetchingActions = [
    ActionType.FETCHED_WIDGETS
  ]

  const FocusedElementActions = [
    ActionType.ELEMENT_SELECTED,
    ActionType.ELEMENT_UNSELECTED,
    ActionType.ELEMENT_DOUBLE_CLICKED,
    ActionType.ELEMENT_BLURRED
  ]

  const DeleteElementActions = [
    ActionType.DELETE_ELEMENT
  ]

  const CopyElementActions = [
    ActionType.COPY_ELEMENT
  ]

  const LoadStateActions = [
    ActionType.LOAD_STATE
  ]

  const ResizeElementActions = [
    ActionType.RESIZE_ELEMENT
  ]

  if (MouseMovementActions.includes(action.type)) {
    newState = handleMouseMovementAction(state, action);
  } else if (DragAndDropActions.includes(action.type)) {
    newState = handleDragAndDropAction(state, action);
  } else if (DataFetchingActions.includes(action.type)) {
    newState = handleDataFetchingAction(state, action);
  } else if (FocusedElementActions.includes(action.type)) {
    newState = handleFocusedElementAction(state, action);
  } else if (DeleteElementActions.includes(action.type)) {
    newState = handleDeleteAction(state, action);
  } else if (CopyElementActions.includes(action.type)) {
    newState = handleCopyAction(state, action);
  } else if (LoadStateActions.includes(action.type)) {
    newState = handleLoadStateAction(state, action);
  } else if (ResizeElementActions.includes(action.type)) {
    newState = handleResizeAction(state, action);
  } else if (action.type === ActionType.ADD_COLUMN) {
    const { elementId } = action;
    const { section, index } = parseId(elementId);
    const container = state[section].html.nodes[index];
    
    if (container && (container.metadata?.childDirection === "horizontal" || container.metadata?.childDirection === "vertical")) {
      // Create a new column
      const newColumn: StorableHtmlNode = {
        element: "div",
        attributes: {
          className: {
            value: container.metadata?.childDirection === "horizontal" ? "vertical" : "horizontal",
            readonly: true,
            input: {
              type: "text",
              displayName: "Class Name",
              tooltip: "This cannot be changed."
            }
          }
        },
        style: {
          "background-color": {
            value: "",
            input: {
              type: "color",
              displayName: "Background Color"
            }
          },
          "border-color": {
            value: "",
            input: {
              type: "color",
              displayName: "Border Color"
            }
          },
          "border-style": {
            value: "",
            input: {
              type: "select",
              displayName: "Border Style",
              options: [
                { value: "none", text: "None" },
                { value: "solid", text: "Solid" },
                { value: "double", text: "Double" },
                { value: "dotted", text: "Dotted" },
                { value: "dashed", text: "Dashed" },
                { value: "groove", text: "Grooved" },
                { value: "ridge", text: "Ridged" },
                { value: "inset", text: "Inset" },
                { value: "outset", text: "Outset" },
                { value: "hidden", text: "Hidden" }
              ]
            }
          },
          "border-width": {
            value: "",
            input: {
              type: "select",
              displayName: "Border Thickness",
              options: [
                { value: "0px", text: "Invisible" },
                { value: "1px", text: "Extra Thin" },
                { value: "2.5px", text: "Thin" },
                { value: "3.5px", text: "Standard" },
                { value: "4.5px", text: "Thick" },
                { value: "6px", text: "Extra Thick" }
              ]
            }
          }
        },
        children: [],
        metadata: {
          draggable: true,
          droppable: true,
          childDirection: container.metadata?.childDirection === "horizontal" ? "vertical" : "horizontal",
          selectable: true
        }
      };

      // Add the new column to the container's children
      newState = { ...state };
      if (newState[section]?.html?.nodes?.[index]?.children) {
        newState[section].html.nodes[index].children.push(newState[section].html.nodes.length);
        newState[section].html.nodes.push(newColumn);

        // Update history
        newState.history = [...newState.history.slice(0, newState.historyIndex + 1), newState];
        newState.historyIndex++;
      }
    }
  } else if (action.type === ActionType.CHANGE_COLUMN_DIRECTION) {
    const { elementId, direction } = action;
    const { section, index } = parseId(elementId);
    const container = state[section].html.nodes[index];
    
    if (container && (container.metadata?.childDirection === "horizontal" || container.metadata?.childDirection === "vertical")) {
      // Create a new state with the updated direction
      const newState = { ...state };
      const node = newState[section].html.nodes[index];
      
      // Update the node's metadata and className
      node.metadata = {
        ...node.metadata,
        childDirection: direction
      };
      
      node.attributes = {
        ...node.attributes,
        className: {
          ...node.attributes.className,
          value: direction
        }
      };
      
      // Update the flex direction in the style
      node.style = {
        ...node.style,
        "flex-direction": {
          value: direction === "horizontal" ? "row" : "column",
          readonly: true
        }
      };
      
      // Update history
      newState.history = [...newState.history.slice(0, newState.historyIndex + 1), newState];
      newState.historyIndex++;
      
      return newState;
    }
  }

  // Update history for all actions except undo/redo
  if (![ActionType.UNDO, ActionType.REDO].includes(action.type)) {
    const historyEntry = { ...newState, history: [], historyIndex: 0 };
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), historyEntry];
    
    return {
      ...newState,
      history: newHistory,
      historyIndex: newHistory.length - 1
    };
  }

  return newState;
}

 
// #region Hooks

// export function useDrag() { }

// export function useDrop() { }

export function useEditor() {
  const context = useContext(EditorContext);

  if (context) {
    return context;
  } else {
    throw new Error("useEditor must be used inside of an EditorProvider!");
  }
}

// #endregion
