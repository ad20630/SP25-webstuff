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
import { handleAddAction } from "./actionHandlers/addHandler";
import { handleResizeAction } from "./actionHandlers/ResizeHandler";
import { handleAttributeAction } from "./actionHandlers/AttributeHandler";
import { DragAndDropState } from "state/dragAndDrop/DragAndDropReducer";
import { parseId } from "./Helpers";
import { findPrimaryNode, sanitizeClassName, sanitizeImageUrl, sanitizeWidthOrHeight } from "components/pages/app/Helpers";
import { handleHistoryAction, saveToHistory } from "./actionHandlers/HistoryHandler";


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
  UPDATE_SEO_METADATA = "UPDATE_SEO_METADATA",
  UNDO = "UNDO",
  REDO = "REDO",
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
  | { type: ActionType.UPDATE_SEO_METADATA; metadata: any }
  | { type: ActionType.ADD_ELEMENT; elementId: string}
  | { type: ActionType.ADD_COLUMN; elementId: string}
  | { type: ActionType.RESIZE_ELEMENT; elementId: string; width: number; height: number }
  | { type: ActionType.ATTRIBUTE_CHANGED; target:"style"|"attributes"; attribute:string; newValue:string }
  | { type: ActionType.LOAD_STATE; payload: EditorState }
  | { type: ActionType.UNDO }
  | { type: ActionType.REDO };


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
  seoMetadata: any;
};

export type DropTargetData = {
  section: "header" | "body" | "footer";
  dropPositionId: number;
};

// #endregion

// Define a reducer to manage the state of the editor
export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  // Handle undo/redo actions first
  if (action.type === ActionType.UNDO || action.type === ActionType.REDO) {
    return handleHistoryAction(state, action);
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

  let newState: EditorState;

  if(MouseMovementActions.includes(action.type)){
    newState = handleMouseMovementAction(state, action)
  } else if(DragAndDropActions.includes(action.type)){
    newState = handleDragAndDropAction(state, action)
  } else if(DataFetchingActions.includes(action.type)){
    newState = handleDataFetchingAction(state, action)
  } else if(FocusedElementActions.includes(action.type)){
    newState = handleFocusedElementAction(state, action)
  } else if(DeleteElementActions.includes(action.type)){
    newState = handleDeleteAction(state, action)
  } else if(CopyElementActions.includes(action.type)){
    newState = handleCopyAction(state, action)
  } else if(LoadStateActions.includes(action.type)){
    newState = handleLoadStateAction(state, action)
  } else if(ResizeElementActions.includes(action.type)){
    newState = handleResizeAction(state, action);
  } else if(action.type === ActionType.ADD_COLUMN){
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
      if (state[section].html.nodes[index].children) {
        state[section].html.nodes[index].children.push(state[section].html.nodes.length);
      }
      state[section].html.nodes.push(newColumn);
      newState = {...state};
    } else {
      newState = state;
    }
  } else if(action.type === ActionType.ATTRIBUTE_CHANGED){
    if(!state.selectedElementId){
      return state;
    }

    const {section, index} = parseId(state.selectedElementId)
    const primaryIndex = findPrimaryNode(index, state, section)
    const node = state[section].html.nodes[primaryIndex ?? index]
    const attr = node[action.target][action.attribute]
    
    let sanitizedValue;
    switch(action.attribute) {
      case 'className':
        sanitizedValue = sanitizeClassName(action.newValue, attr.value);
        break;
      case 'src':
        sanitizedValue = sanitizeImageUrl(action.newValue, attr.value);
        break;
      default:
        sanitizedValue = action.newValue;
    }
  
    if(attr){
      attr.value = sanitizedValue;
    }

    newState = {...state};
  } else {
    newState = state;
  }

  // Save state to history for undoable actions
  const undoableActions = [
    ActionType.DROP,
    ActionType.DELETE_ELEMENT,
    ActionType.COPY_ELEMENT,
    ActionType.ADD_ELEMENT,
    ActionType.ADD_COLUMN,
    ActionType.RESIZE_ELEMENT,
    ActionType.ATTRIBUTE_CHANGED,
    ActionType.LOAD_STATE
  ];

  if (undoableActions.includes(action.type)) {
    return saveToHistory(newState, action);
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
