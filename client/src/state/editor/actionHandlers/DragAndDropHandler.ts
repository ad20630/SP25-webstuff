import { HtmlObject } from "types/HtmlObject";
import { ActionType, EditorAction, EditorState } from "../EditorReducer";
import { sectionFromId, storableNodeToHtmlObject, removeNode, insertDroppedElement, parseId, getDropChildId, getAspectRatio } from "../Helpers";

interface ImageDropPayload {
    type: "image";
    url: string;
    alt: string;
    className?: string;
    style?: {
        width: string;
        height: string;
        objectFit: string;
    };
    initialDimensions?: {
        width: string;
        height: string;
    };
}

function isImageDropPayload(payload: any): payload is ImageDropPayload {
    return payload && typeof payload === "object" && payload.type === "image" && typeof payload.url === "string" && typeof payload.alt === "string";
}

export function handleDragAndDropAction(state: EditorState, action: EditorAction): EditorState {
    let newState: EditorState
    let dropped: HtmlObject;
    let idNum: number;
    let section: "header" | "body" | "footer";

    switch (action.type) {
        case ActionType.START_DRAG:
            newState = { ...state }

            console.log(action.payload)
            if (action.dragRootId) {
                section = sectionFromId(action.dragRootId)
                idNum = parseInt(action.dragRootId.split("-")[1])
                newState[section] = { ...removeNode(idNum, newState[section]) }

                newState.isDragging = true
                console.log(newState.widgets)
                return { ...newState }
            }
            console.log(newState)
            return {
                ...newState,
                isDragging: true,
                draggedItemId: action.payload as number,
            };
        case ActionType.DRAG_OVER: {
            const { section, index } = parseId(action.targetId!)
            const newState = { ...state }
            if (action.targetId !== undefined) {
                let dragged = { ...state.widgets[action.payload.widgetId] }
                if (!dragged) {
                    dragged = { ...state.widgets[state.widgets.length - 1] }
                }
            }

            return {
                ...newState,
                hoveredItemId: action.targetId.toString(),
            };
        }
        case ActionType.DRAG_OUT: {
            const { section, index } = parseId(action.targetId)

            const newState = { ...state }

            newState[section].metadata.preview = undefined

            return { ...state }
        }
        case ActionType.DROP:
            newState = { ...state };
            section = sectionFromId(action.targetId)

            const parent = document.getElementById(action.targetId)

            // Handle image drops
            if (isImageDropPayload(action.payload)) {
                dropped = {
                    metadata: {
                        name: "Image",
                        tooltip: "A place to upload and display an Image",
                        type: "WIDGET",
                        icon: "image-icon"
                    },
                    html: {
                        nodes: [
                            {
                                element: "div",
                                attributes: {
                                    className: { value: "elementContainer" }
                                },
                                style: {
                                    width: {
                                        value: action.payload.initialDimensions?.width || "300px",
                                        input: {
                                            type: "text",
                                            displayName: "Width"
                                        }
                                    },
                                    height: {
                                        value: action.payload.initialDimensions?.height || "200px",
                                        input: {
                                            type: "text",
                                            displayName: "Height"
                                        }
                                    }
                                },
                                children: [1],
                                metadata: {
                                    draggable: true,
                                    selectable: true,
                                    resizable: true,
                                    type: "WIDGET"
                                }
                            },
                            {
                                element: "img",
                                attributes: {
                                    className: {
                                        value: action.payload.className || "image aspect-ratio-preserved",
                                        readonly: true,
                                        input: {
                                            type: "text",
                                            displayName: "Class Name",
                                            tooltip: "This cannot be changed."
                                        }
                                    },
                                    src: {
                                        value: action.payload.url,
                                        input: {
                                            type: "text",
                                            displayName: "File"
                                        }
                                    },
                                    alt: {
                                        value: action.payload.alt || "Image",
                                        input: {
                                            type: "text",
                                            displayName: "Alt Text"
                                        }
                                    }
                                },
                                style: {
                                    width: {
                                        value: "100%",
                                        input: {
                                            type: "text",
                                            displayName: "Width"
                                        }
                                    },
                                    height: {
                                        value: "100%",
                                        input: {
                                            type: "text",
                                            displayName: "Height"
                                        }
                                    },
                                    objectFit: {
                                        value: action.payload.style?.objectFit || "contain",
                                        input: {
                                            type: "select",
                                            displayName: "Object Fit",
                                            options: [
                                                { value: "contain", text: "Contain" },
                                                { value: "cover", text: "Cover" },
                                                { value: "fill", text: "Fill" },
                                                { value: "none", text: "None" },
                                                { value: "scale-down", text: "Scale Down" }
                                            ]
                                        }
                                    }
                                },
                                metadata: {
                                    primary: true
                                }
                            }
                        ]
                    }
                };

                // Calculate aspect ratio and update dimensions if needed
                if (parent && !action.payload.initialDimensions) {
                    getAspectRatio(action.payload.url).then((aspectRatio: number) => {
                        const width = (parent.clientWidth * 0.90);
                        dropped.html.nodes[0].style.width.value = `${width.toFixed(3)}px`;
                        dropped.html.nodes[0].style.height.value = `${(width * (1 / aspectRatio)).toFixed(3)}px`;
                    });
                }
            } else {
                dropped = structuredClone(action.payload);
                dropped.html.nodes.forEach((node) => {
                    if (node.element === "img") {
                        getAspectRatio(node.attributes.src.value).then((aspectRatio: number) => {
                            if (parent) {
                                const width = (parent.clientWidth * 0.90);
                                node.attributes["height"] = {
                                    value: `${(width * (1 / aspectRatio)).toFixed(3)}`,
                                    input: { type: "number" }
                                };
                                node.attributes["width"] = {
                                    value: `${width.toFixed(3)}`,
                                    input: { type: "number" }
                                };
                            }
                        });
                    }
                });
            }

            const calculatedIndex = getDropChildId(action.mouseState, newState, action.targetId);
            newState = insertDroppedElement(calculatedIndex, newState, dropped, action.targetId);

            newState[section].metadata.preview = undefined;

            return {
                ...newState
            };

        case ActionType.CANCEL_DRAG:
            return {
                ...state,
                isDragging: false,
                draggedItemId: null,
                hoveredItemId: null,
            };

        default:
            return state
    }
}
