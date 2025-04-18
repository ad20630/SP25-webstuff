import { ActionType, EditorAction, EditorState } from "../EditorReducer";
import { parseId } from "../Helpers";

export function handleAttributeAction(state: EditorState, action: EditorAction): EditorState {
  if (action.type !== ActionType.ATTRIBUTE_CHANGED) {
    return state;
  }

  const { target, attribute, newValue } = action;
  const { section, index } = parseId(state.selectedElementId!);

  // Create a deep copy of the state to avoid mutations
  const newState = { ...state };
  const sectionData = { ...newState[section] };
  const nodesCopy = [...sectionData.html.nodes];

  // Update the node with the new attribute or style value
  if (nodesCopy[index]) {
    if (target === "attributes") {
      nodesCopy[index] = {
        ...nodesCopy[index],
        attributes: {
          ...nodesCopy[index].attributes,
          [attribute]: {
            ...nodesCopy[index].attributes[attribute],
            value: newValue
          }
        }
      };
    } else if (target === "style") {
      nodesCopy[index] = {
        ...nodesCopy[index],
        style: {
          ...nodesCopy[index].style,
          [attribute]: {
            ...nodesCopy[index].style[attribute],
            value: newValue
          }
        }
      };
    }
  }

  // Update the section with the new nodes array
  sectionData.html.nodes = nodesCopy;
  newState[section] = sectionData;

  return newState;
} 
